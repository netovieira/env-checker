#!/usr/bin/env node

const { getEnvironments } = require('../index.js');


const envFile = process.argv[2];
const projectDir = process.argv[3] ?? '.';
const debug = !['0', 'false'].includes((process.argv[4] || 'false'));

if (!envFile || !projectDir) {
  console.error('Uso: avnt-env-scan <project-dir=.> <debug-mode=false>');
  process.exit(1);
}

getEnvironments(projectDir, debug);
