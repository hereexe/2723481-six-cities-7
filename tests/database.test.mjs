import 'reflect-metadata';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import mongoose from 'mongoose';
import {container} from '../dist/container.js';
import {Component} from '../dist/shared/types/component.enum.js';
import {createOffer} from '../dist/helpers/create-offer.js';
import {getMongoURI} from '../dist/helpers/get-mongo-uri.js';
import {UserModel} from '../dist/shared/modules/user/user.entity.js';
import {OfferModel} from '../dist/shared/modules/offer/offer.entity.js';

const cli = fileURLToPath(new URL('../dist/cli.js', import.meta.url));

test('URI encodes credentials and supports IPv6', () => {
  assert.equal(getMongoURI('::1', 27017, 'six-cities', 'user@host', 'p:a/ss'),
    'mongodb://user%40host:p%3Aa%2Fss@[::1]:27017/six-cities?authSource=admin');
});

test('import requires connection settings', () => {
  const result = spawnSync(process.execPath, [cli, '--import', 'mocks/test.tsv'], {encoding: 'utf8'});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--import <path> <mongodb-uri> <salt>/);
});

test('MongoDB import saves documents, reuses authors and closes connections on errors', {
  skip: !process.env.TEST_MONGO_URI && 'Задайте TEST_MONGO_URI для интеграционной проверки MongoDB.',
  timeout: 30000,
}, async () => {
  const databaseName = `six_cities_test_${process.pid}_${Date.now()}`;
  const connectionUri = new URL(process.env.TEST_MONGO_URI);
  connectionUri.pathname = `/${databaseName}`;
  const uri = connectionUri.toString();
  const directory = await mkdtemp(join(tmpdir(), 'six-cities-import-'));
  const file = join(directory, 'offers.tsv');
  const salt = 'integration-test-salt';
  const databaseClient = container.get(Component.DatabaseClient);
  const users = container.get(Component.UserService);
  const offers = container.get(Component.OfferService);
  const sourceLine = (await readFile(new URL('../mocks/test.tsv', import.meta.url), 'utf8')).trim().split(/\r?\n/)[0];
  const source = createOffer(sourceLine);
  const runImport = (path) => spawnSync(process.execPath, [cli, '--import', path, uri, salt], {
    encoding: 'utf8', timeout: 15000,
  });

  try {
    await databaseClient.connect(uri);
    await writeFile(file, `${sourceLine}\r\n\r\n${sourceLine}`);
    const result = runImport(file);
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Подключение к MongoDB/);
    assert.match(result.stdout, /Соединение с MongoDB установлено/);
    assert.match(result.stdout, /Загружено предложений: 2/);
    assert.match(result.stdout, /Соединение с MongoDB закрыто/);
    assert.ok(!result.stdout.includes(salt));
    assert.equal(await UserModel.countDocuments(), 1);
    assert.equal(await OfferModel.countDocuments(), 2);

    const user = await users.findByEmail(source.author.email);
    assert.ok(user);
    assert.equal((await users.findById(user.id)).email, source.author.email);
    assert.notEqual(user.password, source.author.password);
    assert.ok(user.createdAt instanceof Date);
    assert.ok(user.updatedAt instanceof Date);
    const offer = await OfferModel.findOne();
    assert.ok(offer.author.equals(user._id));
    assert.equal((await offers.findById(offer.id)).title, source.title);
    assert.ok(offer.createdAt instanceof Date);
    assert.ok(offer.updatedAt instanceof Date);
    assert.equal(offer.commentsCount, 0);
    assert.equal(offer.city.name, source.city.name);
    assert.equal(offer.location.latitude, source.location.latitude);
    assert.equal((await offer.populate('author')).author.email, source.author.email);
    assert.equal(await users.findByEmail('missing@example.com'), null);
    assert.equal(await users.findById(new mongoose.Types.ObjectId().toString()), null);
    assert.equal(await offers.findById(new mongoose.Types.ObjectId().toString()), null);

    await writeFile(file, 'invalid TSV row');
    for (const path of [file, join(directory, 'missing.tsv')]) {
      const failed = runImport(path);
      assert.ifError(failed.error);
      assert.equal(failed.status, 1);
      assert.match(failed.stdout, /Соединение с MongoDB закрыто/);
      assert.doesNotMatch(failed.stdout, /Импорт завершён/);
    }
    assert.equal(await OfferModel.countDocuments(), 2);
  } finally {
    // Удаляется только уникальная база, созданная этим тестом.
    if (mongoose.connection.name === databaseName) {
      await mongoose.connection.dropDatabase();
    }
    await databaseClient.disconnect();
    await rm(directory, {recursive: true, force: true});
  }
});
