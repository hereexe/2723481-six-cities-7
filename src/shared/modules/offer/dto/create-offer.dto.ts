import {Types} from 'mongoose';
import {Offer} from '../../../../types/offer.type.js';

export type CreateOfferDto = Omit<Offer, 'author' | 'rating' | 'commentsCount' | 'isFavorite'> & {
  author: Types.ObjectId;
};
