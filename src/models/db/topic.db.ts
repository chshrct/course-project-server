import { model, Model, Schema } from 'mongoose';

export interface ITopic {
  _id: string;
  title: string;
}

const ITopicSchema = new Schema<ITopic>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
  },
  { collection: 'topics', timestamps: true },
);

const TopicModel: Model<ITopic> = model('Topic', ITopicSchema);

export default TopicModel;
