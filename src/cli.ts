#!/usr/bin/env node

import {createReadStream} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import chalk from 'chalk';
import {createOffer} from './helpers/create-offer.js';

const HELP_TEXT = `
Программа для подготовки данных для REST API сервера.

Пример: npm run cli -- --<command> [--arguments]

Команды:
  --version                   выводит номер версии
  --help                      печатает этот текст
  --import <path>             импортирует данные из TSV
  --generate <n> <path> <url> генерирует произвольное количество тестовых данных
`;

async function showVersion(): Promise<void> {
  const packagePath = new URL('../package.json', import.meta.url);
  const packageContent = await readFile(packagePath, 'utf-8');
  const packageData = JSON.parse(packageContent) as {version: string};
  console.log(chalk.green(packageData.version));
}

async function importOffers(filePath: string | undefined): Promise<void> {
  if (!filePath) {
    throw new Error('Укажите путь к TSV-файлу после команды --import.');
  }

  const fileStream = createReadStream(filePath, {encoding: 'utf-8'});
  const lines = createInterface({input: fileStream, crlfDelay: Infinity});
  let importedOffers = 0;

  for await (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const offer = createOffer(line);
    importedOffers++;

    console.log(chalk.cyan(`Предложение №${importedOffers}:`));
    console.log(chalk.white(JSON.stringify(offer, null, 2)));
  }

  console.log(chalk.green(`Импорт завершён. Загружено предложений: ${importedOffers}.`));
}

async function run(): Promise<void> {
  const [command, commandArgument] = process.argv.slice(2);

  switch (command) {
    case undefined:
    case '--help':
      console.log(chalk.blue(HELP_TEXT));
      break;
    case '--version':
      await showVersion();
      break;
    case '--import':
      await importOffers(commandArgument);
      break;
    default:
      console.log(chalk.red(`Неизвестная команда: ${command}`));
      console.log(chalk.blue(HELP_TEXT));
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`Ошибка: ${message}`));
  process.exitCode = 1;
});
