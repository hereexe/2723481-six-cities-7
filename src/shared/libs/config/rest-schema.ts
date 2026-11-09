import {Schema} from 'convict';

export type RestSchema = {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  SALT: string;
};

export const restSchema: Schema<RestSchema> = {
  PORT: {
    doc: 'Порт REST API сервера.',
    format: 'port',
    default: null,
    env: 'PORT',
  },
  DB_HOST: {
    doc: 'IP-адрес сервера базы данных.',
    format: 'ipaddress',
    default: null,
    env: 'DB_HOST',
  },
  SALT: {
    doc: 'Соль для хеширования паролей.',
    format: (value: unknown): void => {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('SALT должна быть непустой строкой.');
      }
    },
    default: null,
    env: 'SALT',
    sensitive: true,
  },
  DB_PORT: {doc: 'Порт MongoDB.', format: 'port', default: 27017, env: 'DB_PORT'},
  DB_NAME: {doc: 'Название базы данных.', format: String, default: 'six-cities', env: 'DB_NAME'},
  DB_USER: {doc: 'Пользователь MongoDB.', format: String, default: '', env: 'DB_USER'},
  DB_PASSWORD: {doc: 'Пароль MongoDB.', format: String, default: '', env: 'DB_PASSWORD', sensitive: true},
};
