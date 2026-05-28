const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const http = require('http');
const { Server } = require('socket.io');
const Quiz = require('./models/Quiz');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, difficulty, numQuestions = 5 } = req.body;
    const prompt = `Generate a ${difficulty} level multiple choice quiz about "${topic}" with ${numQuestions} questions.
    Return ONLY a valid JSON array of objects. Each object MUST have:
    - "question" (string)
    - "options" (array of exactly 4 strings)
    - "correctAnswer" (string, must exactly match one of the options)
    - "explanation" (string, short explanation of why the answer is correct)`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful quiz generation assistant that only outputs valid JSON arrays." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    let generatedQuestions;
    try {
       const content = response.choices[0].message.content;
       const parsed = JSON.parse(content);
       if(Array.isArray(parsed)) generatedQuestions = parsed;
       else if(parsed.questions && Array.isArray(parsed.questions)) generatedQuestions = parsed.questions;
       else throw new Error("Invalid format");
    } catch (parseError) {
       console.error(parseError);
       return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const newQuiz = new Quiz({
      topic,
      difficulty,
      questions: generatedQuestions
    });
    await newQuiz.save();

    res.json({ success: true, quizId: newQuiz._id, questions: generatedQuestions });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.get('/api/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(10);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// MULTIPLAYER SOCKET LOGIC
const rooms = {};

const sampleQuiz = [
  { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language", "Hyper Tool Multi Language"], correctAnswer: "Hyper Text Markup Language" },
  { question: "Choose the correct HTML element for the largest heading:", options: ["<heading>", "<h6>", "<head>", "<h1>"], correctAnswer: "<h1>" },
  { question: "What does CSS stand for?", options: ["Colorful Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets"], correctAnswer: "Cascading Style Sheets" }
];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ username, roomCode }) => {
    if (rooms[roomCode]) {
      socket.emit('error', 'Room already exists');
      return;
    }
    rooms[roomCode] = {
      players: [{ id: socket.id, username, score: 0 }],
      status: 'waiting',
      quiz: sampleQuiz,
      currentQuestion: 0,
      answersSubmitted: 0
    };
    socket.join(roomCode);
    socket.emit('roomJoined', rooms[roomCode]);
  });

  socket.on('joinRoom', ({ username, roomCode }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }
    if (room.status !== 'waiting') {
      socket.emit('error', 'Game already started');
      return;
    }

    room.players.push({ id: socket.id, username, score: 0 });
    socket.join(roomCode);
    
    // Notify both players
    io.to(roomCode).emit('roomJoined', room);
    
    // Start game since 2 players joined
    room.status = 'playing';
    setTimeout(() => {
      io.to(roomCode).emit('gameStarted', {
        question: room.quiz[0],
        totalQuestions: room.quiz.length,
        players: room.players
      });
    }, 2000);
  });

  socket.on('submitAnswer', ({ roomCode, answer }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    const question = room.quiz[room.currentQuestion];

    if (answer === question.correctAnswer) {
      player.score += 10;
    }

    room.answersSubmitted += 1;

    // Send score update
    io.to(roomCode).emit('scoreUpdated', room.players);

    // If all players answered, move to next question or end
    if (room.answersSubmitted >= room.players.length) {
      room.answersSubmitted = 0;
      room.currentQuestion += 1;

      setTimeout(() => {
        if (room.currentQuestion >= room.quiz.length) {
          room.status = 'finished';
          io.to(roomCode).emit('gameOver', room.players);
        } else {
          io.to(roomCode).emit('nextQuestion', room.quiz[room.currentQuestion]);
        }
      }, 2000);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Find room user was in and notify other player
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomCode).emit('playerDisconnected', 'Opponent disconnected. You win!');
        delete rooms[roomCode];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
