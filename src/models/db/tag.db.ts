import { model, Model, Schema, Types } from 'mongoose';

export interface ITag {
  _id: Types.ObjectId;
  title: string;
}

const ITagSchema = new Schema<ITag>(
  {
    _id: Types.ObjectId,
    title: { type: String, required: true },
  },
  { collection: 'tags', timestamps: true },
);

const TagModel: Model<ITag> = model('Tag', ITagSchema);

export default TagModel;
