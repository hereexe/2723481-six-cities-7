import {HydratedDocument, model, Schema, Types} from 'mongoose';
import {Comment} from '../../../types/comment.type.js';

export type CommentEntity = Omit<Comment, 'author'> & {
  author: Types.ObjectId;
  offer: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export type CommentDocument = HydratedDocument<CommentEntity>;

const commentSchema = new Schema<CommentEntity>({
  text: String,
  postDate: {type: Date, default: Date.now},
  rating: Number,
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  offer: {type: Schema.Types.ObjectId, ref: 'Offer', index: true},
}, {collection: 'comments', timestamps: true});

export const CommentModel = model<CommentEntity>('Comment', commentSchema);
