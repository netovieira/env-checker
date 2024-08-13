#!/usr/bin/env node

const { checkEnvVariables } = require('../index.js');


const envFile = process.argv[2];
const projectDir = process.argv[3] ?? '.';
const debug = !['0', 'false'].includes((process.argv[4] || 'false'));

if (!envFile || !projectDir) {
  console.error('Uso: avnt-env-checker <env-file> <project-dir=.> <debug-mode=false>');
  process.exit(1);
}

checkEnvVariables(envFile, projectDir, debug);
