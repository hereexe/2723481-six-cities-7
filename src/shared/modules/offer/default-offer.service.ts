import {inject, injectable} from 'inversify';
import {Model} from 'mongoose';
import {Component} from '../../types/component.enum.js';
import {CreateOffer, OfferDocument, OfferEntity} from './offer.entity.js';
import {OfferService} from './offer-service.interface.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(@inject(Component.OfferModel) private readonly model: Model<OfferEntity>) {}

  public async create(offer: CreateOffer): Promise<OfferDocument> {
    return this.model.create(offer);
  }

  public async findById(id: string): Promise<OfferDocument | null> {
    return this.model.findById(id).exec();
  }
}
