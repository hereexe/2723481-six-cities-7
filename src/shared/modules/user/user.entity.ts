import {HydratedDocument, model, Schema} from 'mongoose';
import {User} from '../../../types/user.type.js';

export type UserEntity = User & {createdAt: Date; updatedAt: Date};
export type UserDocument = HydratedDocument<UserEntity>;

const userSchema = new Schema<UserEntity>({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  avatarPath: String,
  password: {type: String, required: true},
  type: {type: String, required: true},
}, {collection: 'users', timestamps: true});

export const UserModel = model<UserEntity>('User', userSchema);
