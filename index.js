/**
 * @fileoverview Este módulo fornece funcionalidades para verificar e recuperar variáveis de ambiente
 * usadas em um projeto em diferentes linguagens de programação.
 * @module env-checker
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Expressões regulares padrão para encontrar variáveis de ambiente em diferentes linguagens.
 * @type {Object.<string, RegExp>}
 */
const defRegexes = {
  javascript: /process\.env(?:\["([\w-]+)"\]|\.(\w+))/g,
  dotnet: /GetEnvironmentVariable\("([\w-]+)"\)/g,
  flutter: /String\.fromEnvironment\("([\w-]+)"\)/g
};

/**
 * Extensões de arquivo padrão para verificar em cada linguagem.
 * @type {Object.<string, string[]>}
 */
const defExtensions = {
  javascript: ['.js', '.jsx', '.ts', '.tsx'],
  dotnet: ['.cs'],
  flutter: ['.dart']
};

/**
 * Carrega variáveis de ambiente de um arquivo ou objeto.
 * @param {string|Object} envSource - Caminho para um arquivo .env ou .json, ou um objeto contendo variáveis de ambiente.
 * @returns {Object} Um objeto contendo as variáveis de ambiente carregadas.
 * @throws {Error} Se a extensão do arquivo não for suportada ou a entrada for inválida.
 */
function loadEnvVariables(envSource) {
  let envVariables = {};

  if (typeof envSource === 'string') {
    const ext = path.extname(envSource);
    if (ext === '.env') {
      envVariables = dotenv.parse(fs.readFileSync(envSource));
    } else if (ext === '.json') {
      envVariables = JSON.parse(fs.readFileSync(envSource, 'utf-8'));
      if (envSource.includes('taskdef.json') && envVariables.containerDefinitions && envVariables.containerDefinitions.length > 0) {
        const containerDef = envVariables.containerDefinitions[0];
        envVariables = {
          ...((containerDef.environment || []).reduce((bag, item) => ({ ...bag, [item.name]: item.value }), {})),
          ...((containerDef.secrets || []).reduce((bag, item) => ({ ...bag, [item.name]: item.valueFrom }), {}))
        };
      }
    } else {
      throw new Error(`Extensão não suportada: ${ext}`);
    }
  } else if (typeof envSource === 'object' && envSource !== null) {
    envVariables = envSource;
  } else {
    throw new Error('Fonte inválida. Deve ser um caminho para um arquivo .env/.json ou um objeto.');
  }
  
  return envVariables;
}

/**
 * Escaneia um diretório em busca de variáveis de ambiente usadas no projeto.
 * Pré configurado para as liguagens: javascript/typescript, dotnet, dart/flutter, e reconhece as variáveis de ambiente usadas no taskdef.json
 * @param {string} projectDir - O diretório raiz do projeto a ser escaneado.
 * @param {boolean} debug - Se deve registrar informações de depuração.
 * @param {Object.<string, RegExp>} regexes - Expressões regulares personalizadas para encontrar variáveis de ambiente.
 * @param {Object.<string, string[]>} extensions - Extensões de arquivo personalizadas para verificar em cada linguagem.
 * @returns {string[]} Um array de nomes únicos de variáveis de ambiente encontradas no projeto.
 */
function scanDirectory(projectDir, debug = false, regexes = {}, extensions = {}) {
  regexes = { ...defRegexes, ...regexes };
  extensions = { ...defExtensions, ...extensions };
  const envVariables = new Set();

  /**
   * Verifica um arquivo específico em busca de variáveis de ambiente.
   * @param {string} file - O caminho completo do arquivo a ser verificado.
   * @param {string} type - O tipo de arquivo (javascript, dotnet, flutter).
   */
  function checkFile(file, type) {
    if (debug) console.log('Verificando arquivo:', file);
    const content = fs.readFileSync(file, 'utf-8');
    const regex = regexes[type];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const envVar = match[1] || match[2];
      if (debug) console.log('Variável de ambiente encontrada:', envVar);
      envVariables.add(envVar);
    }
  }

  /**
   * Percorre recursivamente um diretório e verifica todos os arquivos relevantes.
   * @param {string} directory - O caminho do diretório a ser percorrido.
   */
  function traverseDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
      const fullPath = path.join(directory, file);
      if (fs.statSync(fullPath).isDirectory()) {
        traverseDirectory(fullPath);
      } else {
        const ext = path.extname(fullPath);
        for (const [type, exts] of Object.entries(extensions)) {
          if (exts.includes(ext)) {
            checkFile(fullPath, type);
            break;
          }
        }
      }
    });
  }

  traverseDirectory(projectDir);
  return Array.from(envVariables);
}

/**
 * Verifica se todas as variáveis de ambiente usadas no projeto estão declaradas no objeto de variáveis de ambiente fornecido.
 * 
 * Pré configurado para as liguagens: javascript/typescript, dotnet, dart/flutter, e reconhece as variáveis de ambiente usadas no taskdef.json
 * 
 * @param {string|Object} envSource - Caminho para um arquivo .env ou .json, ou um objeto contendo as variáveis de ambiente esperadas.
 * @param {string} [projectDir=process.cwd()] - O diretório raiz do projeto a ser escaneado. O padrão é o diretório de trabalho atual.
 * @param {boolean} [debug=false] - Se deve registrar informações de depuração.
 * @param {Object.<string, RegExp>} [regexes={}] - Expressões regulares personalizadas para encontrar variáveis de ambiente em diferentes linguagens.
 * @param {Object.<string, string[]>} [extensions={}] - Extensões de arquivo personalizadas a serem verificadas para diferentes linguagens.
 */
function checkEnvVariables(envSource, projectDir = process.cwd(), debug = false, regexes = {}, extensions = {}) {
  if (debug) {
    console.log('Modo de depuração...');
    console.log('Caminho das variáveis de ambiente:', envSource);
    console.log('Caminho do projeto:', projectDir);
  }

  const envVariables = loadEnvVariables(envSource);
  if (debug) console.log('Variáveis de ambiente carregadas!', envVariables);

  const foundVariables = scanDirectory(projectDir, debug, regexes, extensions);
  const missingVariables = foundVariables.filter(v => !envVariables.hasOwnProperty(v));

  if (missingVariables.length > 0) {
    missingVariables.forEach(envVar => {
      console.error(`A variável de ambiente ${envVar} não está declarada no objeto de variáveis de ambiente.`);
    });
    
    if (typeof envSource === 'string')
      console.error(`Adicione as variáveis faltantes no arquivo ${envSource} para seguir!`);
    else
      console.error(`Adicione as variáveis faltantes no objeto fornecido para validação!`);
    
    process.exit(1);
  } else {
    console.log('Todas as variáveis de ambiente estão declaradas corretamente!');
  }
}

/**
 * Recupera todas as variáveis de ambiente usadas no projeto.
 * 
 * Pré configurado para as liguagens: javascript/typescript, dotnet, dart/flutter, e reconhece as variáveis de ambiente usadas no taskdef.json
 * 
 * @param {string} [projectDir=process.cwd()] - O diretório raiz do projeto a ser escaneado. O padrão é o diretório de trabalho atual.
 * @param {boolean} [debug=false] - Se deve registrar informações de depuração.
 * @param {Object.<string, RegExp>} [regexes={}] - Expressões regulares personalizadas para encontrar variáveis de ambiente em diferentes linguagens.
 * @param {Object.<string, string[]>} [extensions={}] - Extensões de arquivo personalizadas a serem verificadas para diferentes linguagens.
 * @returns {string[]} Um array de nomes únicos de variáveis de ambiente encontradas no projeto.
 */
function getEnvironments(projectDir = process.cwd(), debug = false, regexes = {}, extensions = {}) {
  if (debug) console.log('Escaneando diretório do projeto:', projectDir);
  return scanDirectory(projectDir, debug, regexes, extensions);
}

module.exports = { checkEnvVariables, getEnvironments };