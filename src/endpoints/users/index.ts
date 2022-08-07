import { Request, Response } from 'express';

import UserModel from '../../models/db/user.db';
import { STATUS_CODES } from '../../types/status';

export default {
  getAllUsers: async (req: Request, res: Response) => {
    const users = await UserModel.find({});
    const mappedUsers = users.map(user => ({
      ...user,
      id: user._id,
    }));

    res.send(mappedUsers);
  },
  updateUsersStatus: async (req: Request, res: Response) => {
    await UserModel.updateMany(
      { _id: { $in: req.body.users } },
      { $set: { status: req.body.status } },
    );
    const dbUsers = await UserModel.find({});
    const users = dbUsers.map(user => ({
      ...user,
      id: user._id,
    }));

    res.send(users);
  },
  deleteUsers: async (req: Request, res: Response) => {
    await UserModel.deleteMany({ _id: { $in: req.body.users } });

    res.status(STATUS_CODES.OK).end();
  },
};
