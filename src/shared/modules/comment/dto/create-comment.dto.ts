import {Types} from 'mongoose';
import {Comment} from '../../../../types/comment.type.js';

export type CreateCommentDto = Omit<Comment, 'author' | 'postDate'> & {
  author: Types.ObjectId;
  offer: Types.ObjectId;
};
