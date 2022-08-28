import { model, Model, Schema, Types } from 'mongoose';

export interface ILike {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  item: Types.ObjectId;
}

const ILikeSchema = new Schema<ILike>(
  {
    _id: Types.ObjectId,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  },
  { collection: 'likes', timestamps: true },
);

const LikeModel: Model<ILike> = model('Like', ILikeSchema);

export default LikeModel;
