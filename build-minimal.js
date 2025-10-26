#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up static build environment...');

// Copy static files
const filesToCopy = [
  ['src/app/page.static.tsx', 'src/app/page.tsx'],
  ['src/app/layout.static.tsx', 'src/app/layout.tsx'],
  ['src/app/globals.static.css', 'src/app/globals.css']
];

filesToCopy.forEach(([source, dest]) => {
  try {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copied ${source} to ${dest}`);
  } catch (error) {
    console.log(`⚠️ Could not copy ${source}: ${error.message}`);
  }
});

// Remove ALL problematic directories and API routes
const dirsToRemove = [
  'src/app/api',        // Remove ALL API routes
  'src/app/debug',
  'src/app/auth', 
  'src/app/dashboard',
  'src/app/documents',
  'src/app/upload',
  'src/app/view',
  'src/app/share',
  'src/app/payment',
  'src/app/subscription',
  'src/app/checkout',
  'src/app/demo'
];

// Create temp directory
if (!fs.existsSync('temp_pages')) {
  fs.mkdirSync('temp_pages');
}

dirsToRemove.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      const tempDir = path.join('temp_pages', path.basename(dir));
      fs.renameSync(dir, tempDir);
      console.log(`🚫 Moved ${dir} to temp_pages/`);
    }
  } catch (error) {
    console.log(`⚠️ Could not move ${dir}: ${error.message}`);
  }
});

console.log('✅ Static build environment ready - no API routes, no server dependencies!');