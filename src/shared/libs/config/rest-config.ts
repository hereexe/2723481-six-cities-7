import convict, {Config as ConvictConfig} from 'convict';
import formats from 'convict-format-with-validator';
import {config} from 'dotenv';
import {injectable} from 'inversify';
import {Config} from './config.interface.js';
import {RestSchema, restSchema} from './rest-schema.js';

convict.addFormats(formats);

@injectable()
export class RestConfig implements Config {
  private readonly config: ConvictConfig<RestSchema>;

  constructor() {
    const {error} = config();

    if (error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }

    this.config = convict(restSchema, {args: []});
    this.config.validate({allowed: 'strict'});
  }

  public get<T extends keyof RestSchema>(key: T): RestSchema[T] {
    return this.config.get(key) as RestSchema[T];
  }
}
