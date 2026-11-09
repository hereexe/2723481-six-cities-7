#!/usr/bin/env node

import 'reflect-metadata';
import {mkdir, open, readFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {createInterface} from 'node:readline';
import chalk from 'chalk';
import got, {RequestError} from 'got';
import {createOffer} from './helpers/create-offer.js';
import {generateOffer} from './helpers/generate-offer.js';
import {offerToTsv} from './helpers/offer-to-tsv.js';
import {TSVFileWriter} from './helpers/tsv-file-writer.js';
import {MockOffer} from './types/mock-offer.type.js';
import {container} from './container.js';
import {Component} from './shared/types/component.enum.js';
import {DatabaseClient} from './shared/libs/database-client/database-client.interface.js';
import {UserService} from './shared/modules/user/user-service.interface.js';
import {OfferService} from './shared/modules/offer/offer-service.interface.js';

const HELP_TEXT = `
Программа для подготовки данных для REST API сервера.

Пример: npm run cli -- --<command> [--arguments]

Команды:
  --version                   выводит номер версии
  --help                      печатает этот текст
  --import <path> <uri> <salt> импортирует TSV в MongoDB (URI подключения и соль паролей)
  --generate <n> <path> <url> генерирует произвольное количество тестовых данных
`;

const READ_CHUNK_SIZE = 64 * 1024;

async function showVersion(): Promise<void> {
  const packagePath = new URL('../package.json', import.meta.url);
  const packageContent = await readFile(packagePath, 'utf-8');
  const packageData = JSON.parse(packageContent) as {version: string};
  console.log(chalk.green(packageData.version));
}

async function importOffers(filePath: string | undefined, uri: string | undefined, salt: string | undefined): Promise<void> {
  if (!filePath || !uri || !salt?.trim()) {
    throw new Error('Использование: --import <path> <mongodb-uri> <salt>.');
  }

  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('URI должен начинаться с mongodb:// или mongodb+srv://.');
  }

  const databaseClient = container.get<DatabaseClient>(Component.DatabaseClient);
  const userService = container.get<UserService>(Component.UserService);
  const offerService = container.get<OfferService>(Component.OfferService);

  try {
    await databaseClient.connect(uri);
    const file = await open(filePath, 'r');

    const fileStream = file.createReadStream({encoding: 'utf-8', highWaterMark: READ_CHUNK_SIZE});
    const lines = createInterface({input: fileStream, crlfDelay: Infinity});
    let importedOffers = 0;

    try {
      for await (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const offer = createOffer(line);
        const author = (await userService.findByEmail(offer.author.email)) ?? await userService.create(offer.author, salt);
        await offerService.create({...offer, author: author._id});
        importedOffers++;
      }
    } finally {
      lines.close();
      fileStream.destroy();
      await file.close();
    }

    console.log(chalk.green(`Импорт завершён. Загружено предложений: ${importedOffers}.`));
  } finally {
    await databaseClient.disconnect();
  }
}

async function loadMockOffers(url: string): Promise<MockOffer[]> {
  let templates: unknown;

  try {
    templates = await got.get(url).json();
  } catch (error) {
    const details = error instanceof RequestError ? error.message || error.code : String(error);
    throw new Error(`Не удалось получить данные с ${url}: ${details}`);
  }

  if (!Array.isArray(templates) || templates.length === 0) {
    throw new Error(`JSON-сервис ${url} должен вернуть непустой массив заготовок.`);
  }

  return templates as MockOffer[];
}

async function generateOffers(
  countText: string | undefined,
  filePath: string | undefined,
  url: string | undefined
): Promise<void> {
  const count = Number(countText);

  if (!countText || !Number.isSafeInteger(count) || count < 1 || !filePath || !url) {
    throw new Error('Использование: --generate <n> <filepath> <url>. n должно быть целым положительным числом.');
  }

  const templates = await loadMockOffers(url);

  await mkdir(dirname(filePath), {recursive: true});
  const fileWriter = new TSVFileWriter(filePath);

  for (let index = 0; index < count; index++) {
    await fileWriter.write(offerToTsv(generateOffer(templates)));
  }

  await fileWriter.close();

  console.log(chalk.green(`Создан файл ${filePath}. Предложений: ${count}.`));
}

async function run(): Promise<void> {
  const [command, ...commandArguments] = process.argv.slice(2);

  switch (command) {
    case undefined:
    case '--help':
      console.log(chalk.blue(HELP_TEXT));
      break;
    case '--version':
      await showVersion();
      break;
    case '--import':
      await importOffers(commandArguments[0], commandArguments[1], commandArguments[2]);
      break;
    case '--generate':
      await generateOffers(commandArguments[0], commandArguments[1], commandArguments[2]);
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
