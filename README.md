# FC DDD Patterns

Este repositório contém implementações de padrões do Domain-Driven Design (DDD) desenvolvidos como parte do treinamento da Full Cycle.

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js 20.x LTS** (versão utilizada e validada neste projeto)
- **NPM** (geralmente instalado junto com o Node)

> A versão recomendada está definida no arquivo `.nvmrc`.

## Como instalar as dependências

Após clonar o repositório, abra o terminal na pasta raiz do projeto e execute o comando abaixo para baixar e instalar todas as bibliotecas necessárias (como TypeScript, Jest, Sequelize, SQLite, etc.):

```bash
npm install
```

## Como rodar os testes

O projeto foi construído utilizando **TypeScript** e **Jest** para garantir a qualidade do código através de testes unitários e de integração.

Para executar toda a bateria de testes, basta rodar o comando:

```bash
npm test
```

Esse comando irá primeiro verificar a tipagem do TypeScript (`tsc --noEmit`) e logo em seguida executar todos os testes contidos nos arquivos `.spec.ts` através do Jest.

## Execução com Docker (Recomendado)

Para garantir compatibilidade total de ambiente e evitar problemas com dependências nativas como `sqlite3`, o projeto também pode ser executado via Docker:

```bash
npm run test:docker
```

## Linter/Formatador

Este projeto utiliza o **Biome** para análise e formatação do código.

- Para verificar problemas no código, rode: `npm run lint`
- Para formatar o código e aplicar correções seguras, rode: `npm run lint:fix`

---

_Projeto baseado no módulo de DDD e Arquitetura do curso Full Cycle._
