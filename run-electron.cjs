const { spawn } = require('child_process');
const path = require('path');

// Scrub the environment to ensure Electron doesn't run as Node
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

// Path to local electron
const electronPath = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');

console.log('Launching Electron with scrubbed environment...');

const child = spawn(electronPath, ['.'], {
  env,
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start Electron:', err);
  process.exit(1);
});
