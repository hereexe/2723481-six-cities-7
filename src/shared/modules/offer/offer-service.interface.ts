import {Types} from 'mongoose';
import {OfferDocument, OfferEntity} from './offer.entity.js';
import {CreateOfferDto} from './dto/create-offer.dto.js';
import {UpdateOfferDto} from './dto/update-offer.dto.js';
import {SetFavoriteDto} from './dto/set-favorite.dto.js';

export type OfferView = Omit<OfferEntity, 'ratingTotal'> & {_id: Types.ObjectId; isFavorite: boolean};

export interface OfferService {
  create(offer: CreateOfferDto): Promise<OfferDocument>;
  find(limit?: number, userId?: string): Promise<OfferView[]>;
  findById(id: string, userId?: string): Promise<OfferView | null>;
  findPremiumByCity(city: string, userId?: string): Promise<OfferView[]>;
  findFavorites(userId: string): Promise<OfferView[]>;
  updateById(id: string, dto: UpdateOfferDto): Promise<OfferDocument | null>;
  deleteById(id: string): Promise<OfferDocument | null>;
  setFavorite(id: string, userId: string, dto: SetFavoriteDto): Promise<OfferView | null>;
  addRating(id: string, rating: number): Promise<void>;
}
