import 'reflect-metadata';
import {Container} from 'inversify';
import {Application} from './application/application.js';
import {Config} from './shared/libs/config/config.interface.js';
import {RestConfig} from './shared/libs/config/rest-config.js';
import {Logger} from './shared/libs/logger/logger.interface.js';
import {PinoLogger} from './shared/libs/logger/pino-logger.js';
import {Component} from './shared/types/component.enum.js';

export const container = new Container();

container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
container.bind<Config>(Component.Config).to(RestConfig).inSingletonScope();
container.bind<Application>(Component.Application).to(Application).inSingletonScope();
