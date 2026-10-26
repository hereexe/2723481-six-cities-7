import {RestSchema} from './rest-schema.js';

export interface Config {
  get<T extends keyof RestSchema>(key: T): RestSchema[T];
}
