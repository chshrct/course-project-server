import { model, Model, Schema } from 'mongoose';

export interface ITeg {
  _id: string;
  title: string;
}

const ITegSchema = new Schema<ITeg>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
  },
  { collection: 'tegs', timestamps: true },
);

const TegModel: Model<ITeg> = model('teg', ITegSchema);

export default TegModel;
