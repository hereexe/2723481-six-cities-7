import {inject, injectable} from 'inversify';
import {Config} from '../shared/libs/config/config.interface.js';
import {Logger} from '../shared/libs/logger/logger.interface.js';
import {Component} from '../shared/types/component.enum.js';
import {DatabaseClient} from '../shared/libs/database-client/database-client.interface.js';
import {getMongoURI} from '../helpers/get-mongo-uri.js';

@injectable()
export class Application {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
  ) {}

  public async init(): Promise<void> {
    await this.databaseClient.connect(getMongoURI(
      this.config.get('DB_HOST'), this.config.get('DB_PORT'), this.config.get('DB_NAME'),
      this.config.get('DB_USER'), this.config.get('DB_PASSWORD')
    ));
    this.logger.info(`Приложение инициализировано. Порт: ${this.config.get('PORT')}.`);
  }
}
