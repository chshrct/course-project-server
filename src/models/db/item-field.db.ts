import mongoose, { model, Model, Schema } from 'mongoose';

export interface IItemField {
  _id: mongoose.Types.ObjectId;
  fieldTitle: string;
  fieldType: string;
}

const IItemFieldSchema = new Schema<IItemField>(
  {
    _id: mongoose.Types.ObjectId,
    fieldTitle: { type: String, required: true },
    fieldType: { type: String, required: true },
  },
  { collection: 'itemFields', timestamps: true },
);

const ItemFieldModel: Model<IItemField> = model('ItemField', IItemFieldSchema);

export default ItemFieldModel;
