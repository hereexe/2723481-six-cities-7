import {inject, injectable} from 'inversify';
import mongoose from 'mongoose';
import {Logger} from '../logger/logger.interface.js';
import {Component} from '../../types/component.enum.js';
import {DatabaseClient} from './database-client.interface.js';

@injectable()
export class MongoDatabaseClient implements DatabaseClient {
  constructor(@inject(Component.Logger) private readonly logger: Logger) {}

  public async connect(uri: string): Promise<void> {
    this.logger.info('Подключение к MongoDB...');

    try {
      await mongoose.connect(uri, {serverSelectionTimeoutMS: 5000});
      this.logger.info('Соединение с MongoDB установлено.');
    } catch {
      // URI и ошибки драйвера могут содержать пароль подключения.
      const error = new Error('Не удалось подключиться к MongoDB. Проверьте настройки и доступность сервера.');
      this.logger.error(error.message);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.logger.info('Соединение с MongoDB закрыто.');
  }
}
