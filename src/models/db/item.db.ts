import { model, Model, Schema, Types } from 'mongoose';

import { FieldType } from './collection.db';

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

// IItemSchema.index(
//   { title: 'text', 'itemFields.value': 'text' },
//   { default_language: 'none' },
// );

const ItemModel: Model<IItem> = model('Item', IItemSchema);

export default ItemModel;
