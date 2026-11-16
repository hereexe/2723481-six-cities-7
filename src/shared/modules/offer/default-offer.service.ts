import {inject, injectable} from 'inversify';
import {Model} from 'mongoose';
import {Component} from '../../types/component.enum.js';
import {OfferDocument, OfferEntity} from './offer.entity.js';
import {OfferService, OfferView} from './offer-service.interface.js';
import {CreateOfferDto} from './dto/create-offer.dto.js';
import {UpdateOfferDto} from './dto/update-offer.dto.js';
import {SetFavoriteDto} from './dto/set-favorite.dto.js';
import {CommentEntity} from '../comment/comment.entity.js';
import {UserEntity} from '../user/user.entity.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.OfferModel) private readonly model: Model<OfferEntity>,
    @inject(Component.CommentModel) private readonly commentModel: Model<CommentEntity>,
    @inject(Component.UserModel) private readonly userModel: Model<UserEntity>,
  ) {}

  public async create(offer: CreateOfferDto): Promise<OfferDocument> {
    return this.model.create({...offer, rating: 0, ratingTotal: 0, commentsCount: 0});
  }

  public async find(limit = 60, userId?: string): Promise<OfferView[]> {
    const offers = await this.model.find().sort({postDate: -1, _id: -1}).limit(limit).exec();
    return this.withFavorites(offers, userId);
  }

  public async findById(id: string, userId?: string): Promise<OfferView | null> {
    const offer = await this.model.findById(id).exec();
    return offer ? (await this.withFavorites([offer], userId))[0] : null;
  }

  public async findPremiumByCity(city: string, userId?: string): Promise<OfferView[]> {
    const offers = await this.model.find({'city.name': city, isPremium: true})
      .sort({postDate: -1, _id: -1}).limit(3).exec();
    return this.withFavorites(offers, userId);
  }

  public async findFavorites(userId: string): Promise<OfferView[]> {
    const user = await this.userModel.findById(userId).exec();
    const offers = await this.model.find({_id: {$in: user?.favoriteOffers ?? []}})
      .sort({postDate: -1, _id: -1}).exec();
    return this.withFavorites(offers, userId);
  }

  public async setFavorite(id: string, userId: string, dto: SetFavoriteDto): Promise<OfferView | null> {
    if (!await this.model.exists({_id: id})) {
      return null;
    }

    const update = dto.isFavorite ? {$addToSet: {favoriteOffers: id}} : {$pull: {favoriteOffers: id}};
    const user = await this.userModel.findByIdAndUpdate(userId, update, {new: true}).exec();
    return user ? this.findById(id, userId) : null;
  }

  public async updateById(id: string, dto: UpdateOfferDto): Promise<OfferDocument | null> {
    return this.model.findByIdAndUpdate(id, {$set: dto}, {new: true}).exec();
  }

  public async deleteById(id: string): Promise<OfferDocument | null> {
    const offer = await this.model.findByIdAndDelete(id).exec();
    if (offer) {
      await this.commentModel.deleteMany({offer: offer._id}).exec();
      await this.userModel.updateMany({favoriteOffers: offer._id}, {$pull: {favoriteOffers: offer._id}}).exec();
    }
    return offer;
  }

  public async addRating(id: string, rating: number): Promise<void> {
    // Сумма оценок сохраняет точность среднего и позволяет атомарно учитывать параллельные оценки.
    await this.model.findByIdAndUpdate(id, [
      {$set: {
        ratingTotal: {$add: [{$ifNull: ['$ratingTotal', 0]}, rating]},
        commentsCount: {$add: [{$ifNull: ['$commentsCount', 0]}, 1]},
      }},
      {$set: {rating: {$divide: [{$floor: {$add: [
        {$multiply: [{$divide: ['$ratingTotal', '$commentsCount']}, 10]}, 0.5,
      ]}}, 10]}}},
    ]).exec();
  }

  private async withFavorites(offers: OfferDocument[], userId?: string): Promise<OfferView[]> {
    const user = userId ? await this.userModel.findById(userId).exec() : null;
    return offers.map((offer) => ({
      ...offer.toObject(),
      isFavorite: user?.favoriteOffers.some((id) => id.equals(offer._id)) ?? false,
    }));
  }
}
