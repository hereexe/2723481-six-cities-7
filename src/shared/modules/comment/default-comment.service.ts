import {inject, injectable} from 'inversify';
import {Model} from 'mongoose';
import {Component} from '../../types/component.enum.js';
import {OfferService} from '../offer/offer-service.interface.js';
import {CommentDocument, CommentEntity} from './comment.entity.js';
import {CommentService} from './comment-service.interface.js';
import {CreateCommentDto} from './dto/create-comment.dto.js';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.CommentModel) private readonly model: Model<CommentEntity>,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {}

  public async create(dto: CreateCommentDto): Promise<CommentDocument> {
    if (!await this.offerService.findById(dto.offer.toString())) {
      throw new Error('Предложение не найдено.');
    }

    const comment = await this.model.create(dto);
    await this.offerService.addRating(dto.offer.toString(), dto.rating);
    return comment;
  }

  public async findByOfferId(offerId: string): Promise<CommentDocument[]> {
    return this.model.find({offer: offerId}).sort({postDate: -1, _id: -1}).limit(50).exec();
  }
}
