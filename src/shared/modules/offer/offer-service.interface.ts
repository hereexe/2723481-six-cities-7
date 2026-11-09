import {CreateOffer, OfferDocument} from './offer.entity.js';

export interface OfferService {
  create(offer: CreateOffer): Promise<OfferDocument>;
  findById(id: string): Promise<OfferDocument | null>;
}
