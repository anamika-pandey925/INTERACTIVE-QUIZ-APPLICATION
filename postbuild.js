const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy dev.html as index.html
if (fs.existsSync('dist/dev.html')) {
  fs.copyFileSync('dist/dev.html', 'index.html');
  console.log('Copied dist/dev.html -> index.html');
}

// 2. Copy assets folder
if (fs.existsSync('dist/assets')) {
  copyDirSync('dist/assets', 'assets');
  console.log('Copied dist/assets -> assets/');
}

// 3. Copy other HTML files
if (fs.existsSync('dist')) {
  let files = fs.readdirSync('dist');
  for (let file of files) {
    if (file.endsWith('.html') && file !== 'dev.html') {
      fs.copyFileSync(path.join('dist', file), file);
      console.log(`Copied dist/${file} -> ${file}`);
    }
  }
}
