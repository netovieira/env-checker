# avnt-env-checker

`avnt-env-checker` é uma ferramenta para verificar e gerenciar variáveis de ambiente usadas em seu projeto. Ela verifica se todas as variáveis de ambiente estão declaradas em um arquivo de configuração (`.env`, `.json`) ou em um objeto diretamente, e também permite listar todas as variáveis de ambiente usadas no projeto.

## Instalação

Você pode instalar o pacote via npm:

```bash
npm install -g avnt-env-checker
```

Se preferir instalar localmente em seu projeto:

```bash
npm install avnt-env-checker
```

## Uso

### Usando na Linha de Comando

Após a instalação, você pode usar dois comandos diferentes:

1. Para verificar variáveis de ambiente:
```bash
avnt-env-checker <path-to-env-file-or-json> <path-to-project-directory>
```

2. Para listar todas as variáveis de ambiente usadas no projeto:
```bash
avnt-env-scan <path-to-project-directory>
```

- `<path-to-env-file-or-json>`: Caminho para um arquivo `.env`, `.json`, ou um objeto contendo as variáveis de ambiente.
- `<path-to-project-directory>`: Caminho para o diretório raiz do projeto onde a verificação será realizada.

### Exemplo de Uso no Código

#### Verificando Variáveis de Ambiente

```javascript
const { checkEnvVariables } = require('avnt-env-checker');
const path = require('path');

const envFile = path.resolve(__dirname, 'path/to/your/.env');
const projectDir = path.resolve(__dirname, 'path/to/your/project');

checkEnvVariables(envFile, projectDir);
```

#### Listando Todas as Variáveis de Ambiente Usadas no Projeto

```javascript
const { getEnvironments } = require('avnt-env-checker');
const path = require('path');

const projectDir = path.resolve(__dirname, 'path/to/your/project');

const envVars = getEnvironments(projectDir);
console.log('Variáveis de ambiente usadas no projeto:', envVars);
```

### Suporte a Diferentes Tipos de Arquivo

O `avnt-env-checker` suporta diferentes tipos de arquivo para carregar as variáveis de ambiente:

- Arquivos `.env`
- Arquivos `.json`
- Arquivos `taskdef.json` (usado em configurações de tarefas do AWS ECS)

### Implementando no CI `.gitlab-ci.yaml`

```yaml
stages:
  - test

variables:
  ENV_FILE: ".env"
  PROJECT_DIR: "$CI_PROJECT_DIR"

check_env_variables:
  stage: test
  image: node:18
  before_script:
    - npm install -g avnt-env-checker
  script:
    - avnt-env-checker $ENV_FILE $PROJECT_DIR
```

## Funcionalidades

- Verifica se todas as variáveis de ambiente usadas no projeto estão declaradas.
- Lista todas as variáveis de ambiente utilizadas no projeto.
- Suporta múltiplas linguagens de programação (JavaScript, .NET, Flutter).
- Permite personalização de expressões regulares e extensões de arquivo para busca de variáveis.
- Modo de depuração para ajudar na resolução de problemas.

## Dependências

- [dotenv](https://www.npmjs.com/package/dotenv) - Para carregar variáveis de ambiente a partir de arquivos `.env`.

## Autor

Anthero Vieira Neto  
Email: anthero@outlook.com.br