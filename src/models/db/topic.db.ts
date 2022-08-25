import { model, Model, Schema, Types } from 'mongoose';

export interface ITopic {
  _id: Types.ObjectId;
  title: string;
}

const ITopicSchema = new Schema<ITopic>(
  {
    _id: Types.ObjectId,
    title: { type: String, required: true },
  },
  { collection: 'topics', timestamps: true },
);

const TopicModel: Model<ITopic> = model('Topic', ITopicSchema);

export default TopicModel;
