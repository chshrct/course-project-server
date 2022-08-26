import { model, Model, Schema, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  message: string;
  user: Types.ObjectId;
  item: Types.ObjectId;
  createdAt?: Date;
}

const ICommentSchema = new Schema<IComment>(
  {
    _id: Types.ObjectId,
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  },
  { collection: 'comments', timestamps: true },
);

const CommentModel: Model<IComment> = model('Comment', ICommentSchema);

export default CommentModel;
