import { model, Model, Schema, Types } from 'mongoose';

import ItemModel from './item.db';

export type FieldTypesType = `number` | 'title' | 'text' | 'date' | 'check';

export type FieldType = {
  title: string;
  type: FieldTypesType;
};

export interface ICollection {
  _id: Types.ObjectId;
  title: string;
  description: string;
  image: string | null;
  owner: Types.ObjectId;
  topics: Types.ObjectId[];
  itemFields: FieldType[];
}

const ICollectionSchema = new Schema<ICollection>(
  {
    _id: Types.ObjectId,
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topics: [{ type: Schema.Types.ObjectId, ref: 'Topic', required: true }],
    itemFields: [
      {
        title: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
  },
  { collection: 'collections', timestamps: true },
);

ICollectionSchema.pre('deleteMany', async function cb(next) {
  // @ts-ignore
  const deletedCollectionIdsArray = this._conditions._id.$in;
  const deletedItemIds = (
    await ItemModel.find({
      collections: { $in: deletedCollectionIdsArray },
    })
  ).map(item => item.id);

  await ItemModel.deleteMany({ _id: { $in: deletedItemIds } });
  next();
});

const CollectionModel: Model<ICollection> = model('Collection', ICollectionSchema);

export default CollectionModel;
