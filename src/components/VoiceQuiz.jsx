import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ArrowRight, CheckCircle2, XCircle, Play, Square } from 'lucide-react';

const mockQuiz = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Preprocessor",
      "Hyper Text Markup Language",
      "Hyper Text Multiple Language",
      "Hyper Tool Multi Language"
    ],
    correctAnswer: "Hyper Text Markup Language"
  },
  {
    question: "Which of the following is a JavaScript framework?",
    options: ["Django", "Flask", "React", "Laravel"],
    correctAnswer: "React"
  },
  {
    question: "What is the primary use of CSS?",
    options: ["Database Management", "Server-side scripting", "Styling web pages", "Machine Learning"],
    correctAnswer: "Styling web pages"
  }
];

export default function VoiceQuiz() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  
  // Voice feature states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedbackMsg('Listening for commands...');
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript.toLowerCase().trim();
        setTranscript(result);
        handleVoiceCommand(result);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          setFeedbackMsg('Microphone error. Try again.');
        }
      };

      recognition.onend = () => {
        // Automatically restart listening if we still want to be listening
        // Managed by state in toggleListening instead
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setFeedbackMsg('Speech Recognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synth.cancel();
    };
  }, []);

  // Read question aloud when it changes
  useEffect(() => {
    if (!quizComplete && mockQuiz[currentQIndex]) {
      readCurrentQuestion();
    }
  }, [currentQIndex, quizComplete]);

  const readCurrentQuestion = () => {
    if (synth.speaking) synth.cancel();
    
    const currentQ = mockQuiz[currentQIndex];
    let textToSpeak = `Question ${currentQIndex + 1}. ${currentQ.question} Options are: `;
    currentQ.options.forEach((opt, index) => {
      textToSpeak += `Option ${index + 1}: ${opt}. `;
    });

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-start listening after reading if not already listening
      if (!isListening && recognitionRef.current && !isAnswered) {
         try { recognitionRef.current.start(); } catch(e) {}
      }
    };
    
    synth.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setFeedbackMsg('Microphone turned off.');
    } else {
      stopSpeaking(); // Stop reading if they interrupt
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition might already be started
      }
    }
  };

  const handleVoiceCommand = (command) => {
    if (quizComplete) return;

    const currentQ = mockQuiz[currentQIndex];
    
    // Command: "Next question"
    if (command.includes('next') && isAnswered) {
      nextQuestion();
      return;
    }

    if (isAnswered) return;

    // Mapping numbers/words to option index
    const numberWords = ['one', 'two', 'three', 'four', '1', '2', '3', '4'];
    let selectedIdx = -1;

    for (let i = 0; i < numberWords.length; i++) {
      if (command.includes(`option ${numberWords[i]}`) || command === numberWords[i]) {
        selectedIdx = i % 4;
        break;
      }
    }

    // Try matching option text directly
    if (selectedIdx === -1) {
      const matchIdx = currentQ.options.findIndex(opt => 
        command.includes(opt.toLowerCase())
      );
      if (matchIdx !== -1) selectedIdx = matchIdx;
    }

    if (selectedIdx !== -1) {
      handleSelectOption(currentQ.options[selectedIdx]);
    } else {
      setFeedbackMsg(`I heard "${command}". Say "Option 1" or the exact answer.`);
      // Use speech to inform the user
      const utterance = new SpeechSynthesisUtterance("I didn't catch that. Please say option 1, 2, 3, or 4.");
      synth.speak(utterance);
    }
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    
    // Stop listening when answering to prevent echo
    if (isListening && recognitionRef.current) {
       recognitionRef.current.stop();
       setIsListening(false);
    }

    setSelectedAnswer(option);
    setIsAnswered(true);
    
    const isCorrect = option === mockQuiz[currentQIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedbackMsg('Correct!');
      const utterance = new SpeechSynthesisUtterance("Correct! Say next question to continue.");
      synth.speak(utterance);
    } else {
      setFeedbackMsg('Incorrect.');
      const utterance = new SpeechSynthesisUtterance(`Incorrect. The correct answer is ${mockQuiz[currentQIndex].correctAnswer}. Say next question to continue.`);
      synth.speak(utterance);
    }
  };

  const nextQuestion = () => {
    stopSpeaking();
    if (currentQIndex < mockQuiz.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswered(false);
      setTranscript('');
      setFeedbackMsg('');
    } else {
      setQuizComplete(true);
    }
  };

  if (quizComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Quiz Finished!</h2>
        <div className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mb-8">
          {score} / {mockQuiz.length}
        </div>
        <button 
          onClick={() => {
            setCurrentQIndex(0);
            setScore(0);
            setQuizComplete(false);
            setIsAnswered(false);
            setSelectedAnswer('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Restart Voice Quiz
        </button>
      </div>
    );
  }

  const currentQ = mockQuiz[currentQIndex];

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
      
      {/* Voice Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleListening}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all shadow-md ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            aria-label={isListening ? "Stop Microphone" : "Start Microphone"}
          >
            {isListening ? (
              <>
                <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75"></div>
                <Square size={24} className="relative z-10" fill="currentColor" />
              </>
            ) : (
              <Mic size={28} />
            )}
          </button>
          
          <div>
            <p className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              Voice Commands {isListening ? <span className="text-red-500 animate-pulse">● Live</span> : <span className="text-gray-400">Off</span>}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
              Try saying "Option 1" or read the answer aloud.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
           <button 
            onClick={isSpeaking ? stopSpeaking : readCurrentQuestion}
            className={`p-3 rounded-full transition-colors ${isSpeaking ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            aria-label={isSpeaking ? "Stop Reading" : "Read Question"}
           >
             {isSpeaking ? <Volume2 size={24} className="animate-pulse" /> : <Play size={24} />}
           </button>
           <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Question Reader</span>
        </div>
      </div>

      {/* Transcript & Feedback */}
      {(transcript || feedbackMsg) && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start gap-3">
          <Mic size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            {transcript && <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-1">"{transcript}"</p>}
            <p className="font-semibold text-blue-800 dark:text-blue-300">{feedbackMsg}</p>
          </div>
        </div>
      )}

      {/* Question Progress */}
      <div className="mb-6 flex justify-between items-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <span>Question {currentQIndex + 1} of {mockQuiz.length}</span>
        <span>Score: {score}</span>
      </div>

      <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white leading-tight">
        {currentQ.question}
      </h3>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {currentQ.options.map((opt, idx) => {
          let btnClass = "border-2 text-left px-5 py-4 rounded-xl font-medium transition-all relative overflow-hidden ";
          
          if (!isAnswered) {
            btnClass += "border-gray-200 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer";
          } else {
            btnClass += "cursor-default ";
            if (opt === currentQ.correctAnswer) {
              btnClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/40 dark:border-green-500 dark:text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
            } else if (opt === selectedAnswer) {
              btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200";
            } else {
              btnClass += "opacity-50 border-gray-200 dark:border-gray-700";
            }
          }

          return (
            <button 
              key={idx} 
              onClick={() => handleSelectOption(opt)}
              disabled={isAnswered}
              className={btnClass}
              aria-label={`Option ${idx + 1}: ${opt}`}
            >
              <div className="flex items-center justify-between z-10 relative">
                <span className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm font-bold border border-gray-200 dark:border-gray-700">
                    {idx + 1}
                  </span>
                  {opt}
                </span>
                {isAnswered && opt === currentQ.correctAnswer && <CheckCircle2 className="text-green-500 w-6 h-6" />}
                {isAnswered && opt === selectedAnswer && opt !== currentQ.correctAnswer && <XCircle className="text-red-500 w-6 h-6" />}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <button 
          onClick={nextQuestion}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          {currentQIndex < mockQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}
