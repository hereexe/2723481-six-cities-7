import 'reflect-metadata';
import {Application} from './application/application.js';
import {container} from './container.js';
import {Logger} from './shared/libs/logger/logger.interface.js';
import {Component} from './shared/types/component.enum.js';

const logger = container.get<Logger>(Component.Logger);

try {
  const application = container.get<Application>(Component.Application);
  application.init();
} catch (error: unknown) {
  logger.error('Не удалось инициализировать приложение.', error instanceof Error ? error : new Error(String(error)));
  process.exitCode = 1;
}
