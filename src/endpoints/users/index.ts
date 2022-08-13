import { Request, Response } from 'express';

import UserModel from '../../models/db/user.db';
import { STATUS_CODES } from '../../types/status';
import { AuthMiddlewareBodyType } from '../auth/types';

import {
  DeleteUsersRequestBodyType,
  GetAllUsersRequestQueryType,
  GetAllUsersResponseBodyType,
  UpdateUsersRequestBodyType,
  UpdateUsersResponseBodyType,
} from './types';

const DEFAULT_USERS_PAGE_LIMIT = 10;

export default {
  getAllUsers: async (
    req: Request<{}, {}, AuthMiddlewareBodyType, GetAllUsersRequestQueryType>,
    res: Response<GetAllUsersResponseBodyType>,
  ) => {
    let { page = 1, limit = DEFAULT_USERS_PAGE_LIMIT } = req.query;

    page = Number(page);
    limit = Number(limit);
    const users = await UserModel.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await UserModel.countDocuments();

    const mappedUsers = users.map(({ _id: id, name, email, status, access }) => ({
      id,
      name,
      email,
      status,
      access,
    }));

    res.send({ users: mappedUsers, count });
  },
  updateUsers: async (
    req: Request<{}, {}, UpdateUsersRequestBodyType>,
    res: Response<UpdateUsersResponseBodyType>,
  ) => {
    const { userIds, update } = req.body;

    await UserModel.updateMany({ _id: { $in: userIds } }, { $set: update });
    const changedUsers = await UserModel.find({ _id: { $in: userIds } });

    const users = changedUsers.map(({ _id: id, name, email, status, access }) => ({
      id,
      name,
      email,
      status,
      access,
    }));

    res.send({ users });
  },
  deleteUsers: async (
    req: Request<{}, {}, DeleteUsersRequestBodyType>,
    res: Response,
  ) => {
    await UserModel.deleteMany({ _id: { $in: req.body.userIds } });

    res.status(STATUS_CODES.OK).end();
  },
};
