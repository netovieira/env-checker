#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { checkEnvVariables } = require('../index.js');

function cloneRepo(repoUrl, targetDir, branch) {
  console.log(`Cloning repository: ${repoUrl}, branch: ${branch}`);
  execSync(`git clone -b ${branch} ${repoUrl} ${targetDir}`, { stdio: 'inherit' });
}

function findEnvSource(projectDir, envFileName) {
  const filePath = path.join(projectDir, envFileName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  throw new Error('No env source file found');
}

const repoUrl = process.argv[2];
const branch = process.argv[3] || 'main';
const envFile = process.argv[4] || '.env';
const projectPath = process.argv[5] || false;
const debug = !['0', 'false'].includes((process.argv[6] || 'false').toLowerCase());

if (!repoUrl) {
  console.error('Usage/Uso: avnt-env-checker-from-git <repo-url> <branch-name=main> <env-file-path=.env> <project-path=""> <debug-mode=false>');
  process.exit(1);
}

const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'avnt-env-checker-'));
const tempDir = projectPath ? path.join(baseDir, projectPath) : baseDir;

try {
  cloneRepo(repoUrl, tempDir, branch);
  const envSourcePath = findEnvSource(tempDir, envFile);
  console.log(`Found env source file: ${envSourcePath}`);
  
  const envFilePath = path.join(tempDir, envFile);
  fs.copyFileSync(envSourcePath, envFilePath);
  
  checkEnvVariables(envFilePath, tempDir, debug);
} catch (error) {
  console.error('Error:', error.message);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}