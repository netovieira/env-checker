#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getEnvironments } = require('../index.js');

function cloneRepo(repoUrl, targetDir, branch) {
  console.log(`Cloning repository: ${repoUrl}, branch: ${branch}`);
  execSync(`git clone -b ${branch} ${repoUrl} ${targetDir}`, { stdio: 'inherit' });
}

const repoUrl = process.argv[2];
const branch = process.argv[3] || "main";
const projectPath = process.argv[4] || false;
const debug = !['0', 'false'].includes((process.argv[5] || 'false').toLowerCase());

if (!repoUrl) {
  console.error('Usage/Uso: avnt-env-scan-from-git <repo-url> <branch-name="main"> <project-path=""> <debug-mode=false>');
  process.exit(1);
}

const tempDir = projectPath 
? path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'avnt-env-checker-'), projectPath)) 
: fs.mkdtempSync(path.join(os.tmpdir(), 'avnt-env-checker-'));

try {
  cloneRepo(repoUrl, tempDir, branch);
  console.log( getEnvironments(tempDir, debug) );
} catch (error) {
  console.error('Error:', error.message);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}