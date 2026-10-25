import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';

const entry = fileURLToPath(new URL('../dist/main.js', import.meta.url));
const validEnv = {PORT: '4000', DB_HOST: '127.0.0.1', SALT: 'test-random-salt'};

function runApplication(settings = {}, dotenv) {
  const cwd = mkdtempSync(join(tmpdir(), 'six-cities-'));
  const env = {...process.env};

  for (const key of Object.keys(validEnv)) {
    delete env[key];
  }

  try {
    if (dotenv !== undefined) {
      writeFileSync(join(cwd, '.env'), dotenv);
    }

    const result = spawnSync(process.execPath, [entry], {
      cwd,
      env: {...env, ...settings},
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.ifError(result.error);
    return result;
  } finally {
    rmSync(cwd, {recursive: true, force: true});
  }
}

test('DI startup loads .env, logs the port and keeps the salt private', () => {
  const dotenv = Object.entries(validEnv).map(([key, value]) => `${key}=${value}`).join('\n');
  const result = runApplication({}, dotenv);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const log = JSON.parse(result.stdout.trim());
  assert.equal(log.level, 30);
  assert.match(log.msg, /инициализировано/);
  assert.match(log.msg, /4000/);
  assert.ok(!result.stdout.includes(validEnv.SALT));
  assert.ok(!result.stdout.includes(validEnv.DB_HOST));
});

test('environment overrides .env and IPv6 is accepted', () => {
  const result = runApplication({...validEnv, PORT: '5000', DB_HOST: '::1'}, 'PORT=4000');
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(JSON.parse(result.stdout.trim()).msg, /5000/);
});

for (const key of Object.keys(validEnv)) {
  test(`${key} is required`, () => {
    const env = {...validEnv};
    delete env[key];
    const result = runApplication(env);
    assert.equal(result.status, 1);
    const log = JSON.parse(result.stdout.trim());
    assert.equal(log.level, 50);
    assert.match(log.err.message, new RegExp(key));
    assert.ok(!result.stdout.includes(validEnv.SALT));
  });
}

for (const [key, value] of [
  ['PORT', 'not-a-port'], ['PORT', '65536'], ['PORT', '-1'], ['PORT', ''],
  ['DB_HOST', 'localhost'], ['DB_HOST', '999.1.2.3'], ['DB_HOST', ''],
  ['SALT', ''], ['SALT', '   '],
]) {
  test(`invalid ${key} (${JSON.stringify(value)}) fails through the logger`, () => {
    const result = runApplication({...validEnv, [key]: value});
    assert.equal(result.status, 1);
    const log = JSON.parse(result.stdout.trim());
    assert.equal(log.level, 50);
    assert.match(log.err.message, new RegExp(key));
  });
}
