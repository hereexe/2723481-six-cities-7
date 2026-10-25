import {Schema} from 'convict';

export type RestSchema = {
  PORT: number;
  DB_HOST: string;
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
};
