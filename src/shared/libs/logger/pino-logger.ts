import {injectable} from 'inversify';
import {pino} from 'pino';
import {Logger} from './logger.interface.js';

@injectable()
export class PinoLogger implements Logger {
  private readonly logger = pino();

  public debug(message: string): void {
    this.logger.debug(message);
  }

  public info(message: string): void {
    this.logger.info(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public error(message: string, error?: Error): void {
    this.logger.error({err: error}, message);
  }
}
