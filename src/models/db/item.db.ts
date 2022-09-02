import { model, Model, Schema, Types } from 'mongoose';

import { FieldType } from './collection.db';
import CommentModel from './comment.db';
import LikeModel from './like.db.';

export type ItemFieldType = FieldType & { value: string | Date | boolean | number };

export interface IItem {
  _id: Types.ObjectId;
  title: string;
  collections: Types.ObjectId;
  tags: Types.ObjectId[];
  itemFields: ItemFieldType[];
}

const IItemSchema = new Schema<IItem>(
  {
    _id: Types.ObjectId,
    title: { type: String, required: true },
    collections: { type: Schema.Types.ObjectId, ref: 'Collection', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag', required: true }],
    itemFields: [
      {
        title: { type: String, required: true },
        type: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
      },
    ],
  },
  { collection: 'items', timestamps: true },
);

IItemSchema.pre('deleteMany', async function cb(next) {
  // @ts-ignore
  const deletedItemIdsArray = this._conditions._id.$in;

  await CommentModel.deleteMany({ item: { $in: deletedItemIdsArray } });
  await LikeModel.deleteMany({ item: { $in: deletedItemIdsArray } });
  next();
});

const ItemModel: Model<IItem> = model('Item', IItemSchema);

export default ItemModel;
