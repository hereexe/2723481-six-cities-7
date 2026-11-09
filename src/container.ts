import 'reflect-metadata';
import {Container} from 'inversify';
import {Application} from './application/application.js';
import {Config} from './shared/libs/config/config.interface.js';
import {RestConfig} from './shared/libs/config/rest-config.js';
import {Logger} from './shared/libs/logger/logger.interface.js';
import {PinoLogger} from './shared/libs/logger/pino-logger.js';
import {Component} from './shared/types/component.enum.js';
import {DatabaseClient} from './shared/libs/database-client/database-client.interface.js';
import {MongoDatabaseClient} from './shared/libs/database-client/mongo-database-client.js';
import {UserModel} from './shared/modules/user/user.entity.js';
import {DefaultUserService} from './shared/modules/user/default-user.service.js';
import {UserService} from './shared/modules/user/user-service.interface.js';
import {OfferModel} from './shared/modules/offer/offer.entity.js';
import {DefaultOfferService} from './shared/modules/offer/default-offer.service.js';
import {OfferService} from './shared/modules/offer/offer-service.interface.js';

export const container = new Container();

container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
container.bind<Config>(Component.Config).to(RestConfig).inSingletonScope();
container.bind<Application>(Component.Application).to(Application).inSingletonScope();
container.bind<DatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();
container.bind(Component.UserModel).toConstantValue(UserModel);
container.bind<UserService>(Component.UserService).to(DefaultUserService).inSingletonScope();
container.bind(Component.OfferModel).toConstantValue(OfferModel);
container.bind<OfferService>(Component.OfferService).to(DefaultOfferService).inSingletonScope();
