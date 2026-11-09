import {scryptSync} from 'node:crypto';
import {inject, injectable} from 'inversify';
import {Model} from 'mongoose';
import {User} from '../../../types/user.type.js';
import {Component} from '../../types/component.enum.js';
import {UserDocument, UserEntity} from './user.entity.js';
import {UserService} from './user-service.interface.js';

@injectable()
export class DefaultUserService implements UserService {
  constructor(@inject(Component.UserModel) private readonly model: Model<UserEntity>) {}

  public async create(user: User, salt: string): Promise<UserDocument> {
    if (!salt.trim()) {
      throw new Error('Соль для хеширования паролей не должна быть пустой.');
    }

    return this.model.create({...user, password: scryptSync(user.password, salt, 64).toString('hex')});
  }

  public async findById(id: string): Promise<UserDocument | null> {
    return this.model.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({email}).exec();
  }
}
