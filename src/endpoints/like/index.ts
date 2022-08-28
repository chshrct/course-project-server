import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import LikeModel, { ILike } from '../../models/db/like.db.';

import {
  CreateLikeRequestType,
  DeleteLikeRequestType,
  DeleteLikeResponseType,
  GetItemLikesRequestType,
  GetItemLikesResponseType,
  LikeType,
} from './types';

export default {
  getItemLikes: async (
    req: Request<GetItemLikesRequestType>,
    res: Response<GetItemLikesResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const likesExists = await LikeModel.find({ item: id });

      const users = likesExists.map(like => like.user._id.toString());

      res.send({ users });
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  createLike: async (
    req: Request<{}, {}, CreateLikeRequestType>,
    res: Response<LikeType>,
    next: NextFunction,
  ) => {
    try {
      const { item, user } = req.body;

      const newLike: ILike = {
        _id: new mongoose.Types.ObjectId(),
        item: new mongoose.Types.ObjectId(item),
        user: new mongoose.Types.ObjectId(user),
      };

      const likeExists = await LikeModel.create(newLike);

      if (!likeExists) return next(new ErrorException(ErrorCode.UnknownError));

      const likeRes: LikeType = {
        id: likeExists.id,
        item: likeExists.item._id.toString(),
        user: likeExists.user._id.toString(),
      };

      res.send(likeRes);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  deleteLike: async (
    req: Request<{}, {}, DeleteLikeRequestType>,
    res: Response<DeleteLikeResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { item, user } = req.body;

      await LikeModel.deleteOne({
        item: new mongoose.Types.ObjectId(item),
        user: new mongoose.Types.ObjectId(user),
      });

      res.send({ deleted: true });
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
