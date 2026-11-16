import {HydratedDocument, model, Schema, Types} from 'mongoose';
import {Offer} from '../../../types/offer.type.js';

export type OfferEntity = Omit<Offer, 'author' | 'isFavorite'> & {
  author: Types.ObjectId;
  ratingTotal: number;
  createdAt: Date;
  updatedAt: Date;
};
export type OfferDocument = HydratedDocument<OfferEntity>;

const locationSchema = new Schema({latitude: Number, longitude: Number}, {_id: false});
const citySchema = new Schema({name: String, location: locationSchema}, {_id: false});

const offerSchema = new Schema<OfferEntity>({
  title: {type: String, required: true},
  description: String,
  postDate: Date,
  city: citySchema,
  previewImage: String,
  images: [String],
  isPremium: Boolean,
  rating: {type: Number, default: 0},
  ratingTotal: {type: Number, default: 0, select: false},
  type: String,
  rooms: Number,
  guests: Number,
  price: Number,
  facilities: [String],
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  commentsCount: {type: Number, default: 0},
  location: locationSchema,
}, {collection: 'offers', timestamps: true});

export const OfferModel = model<OfferEntity>('Offer', offerSchema);
