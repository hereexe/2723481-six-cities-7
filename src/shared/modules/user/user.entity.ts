import {HydratedDocument, model, Schema, Types} from 'mongoose';
import {User} from '../../../types/user.type.js';

export type UserEntity = User & {favoriteOffers: Types.ObjectId[]; createdAt: Date; updatedAt: Date};
export type UserDocument = HydratedDocument<UserEntity>;

const userSchema = new Schema<UserEntity>({
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  avatarPath: String,
  password: {type: String, required: true},
  type: {type: String, required: true},
  favoriteOffers: [{type: Schema.Types.ObjectId, ref: 'Offer'}],
}, {collection: 'users', timestamps: true});

export const UserModel = model<UserEntity>('User', userSchema);
