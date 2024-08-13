#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { checkEnvVariables, getEnvironments } = require('../index.js');

function cloneRepo(repoUrl, targetDir) {
  console.log(`Cloning repository: ${repoUrl}`);
  execSync(`git clone ${repoUrl} ${targetDir}`, { stdio: 'inherit' });
}

function findEnvSource(projectDir, envFileName) {
  const filePath = path.join(projectDir, envFileName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  throw new Error('No env source file found');
}

const repoUrl = process.argv[2];
const envFile = process.argv[3] || '.env';
const debug = !['0', 'false'].includes((process.argv[4] || 'false').toLowerCase());

if (!repoUrl) {
  console.error('Usage: avnt-env-scan-by-git <repo-url> <debug-mode=false>');
  process.exit(1);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'avnt-env-checker-'));

try {
  cloneRepo(repoUrl, tempDir);

  const envSourcePath = findEnvSource(tempDir, envFile);
  console.log(`Found env source file: ${envSourcePath}`);
  
  const envFilePath = path.join(tempDir, envFile);
  fs.copyFileSync(envSourcePath, envFilePath);
  
  console.log( getEnvironments(tempDir, debug) );
} catch (error) {
  console.error('Error:', error.message);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}