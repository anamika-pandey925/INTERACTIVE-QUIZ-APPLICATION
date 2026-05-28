const { execSync } = require('child_process');

try {
  console.log('🔄 Syncing all changes with GitHub...');
  
  // 1. Add all changed files
  execSync('git add .', { stdio: 'inherit' });
  
  // 2. Commit changes with a timestamp
  const timestamp = new Date().toLocaleString();
  const commitMessage = `Auto-sync: ${timestamp}`;
  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  } catch (commitError) {
    console.log('ℹ️ No new changes to commit.');
  }
  
  // 3. Push to remote main branch
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Successfully pushed all changes to GitHub Pages!');
} catch (error) {
  console.error('❌ Sync failed:', error.message);
}
