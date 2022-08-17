import mongoose, { model, Model, Schema } from 'mongoose';

import { UserAccessType, UserStatusType } from './types';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  access: UserAccessType;
  status: UserStatusType;
}

const IUserSchema = new Schema<IUser>(
  {
    _id: mongoose.Types.ObjectId,
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    access: { type: String, required: true },
    status: { type: String, required: true },
  },
  { collection: 'users', timestamps: true },
);

const UserModel: Model<IUser> = model('User', IUserSchema);

export default UserModel;
