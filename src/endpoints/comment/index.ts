import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import CommentModel, { IComment } from '../../models/db/comment.db';
import { IUser } from '../../models/db/user.db';

import { CommentResponseType, CreateCommentRequestType } from './types';

export default {
  createComment: async (
    req: Request<{}, {}, CreateCommentRequestType>,
    res: Response<CommentResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { item, message, user } = req.body;
      const commentIdDb = new mongoose.Types.ObjectId();

      const newComment: IComment = {
        _id: commentIdDb,
        message,
        item: new mongoose.Types.ObjectId(item),
        user: new mongoose.Types.ObjectId(user),
      };

      await CommentModel.create(newComment);

      const commentExists = await CommentModel.findById(commentIdDb).populate<{
        user: IUser;
      }>('user');

      if (!commentExists) return next(new ErrorException(ErrorCode.NotFound));

      const commentData: CommentResponseType = {
        id: commentExists._id.toString(),
        item: commentExists.item.toString(),
        user: {
          id: commentExists.user._id.toString(),
          name: commentExists.user.name,
        },
        message: commentExists.message,
        date: commentExists.createdAt!.toString(),
      };

      res.send(commentData);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  getComments: async (
    req: Request<{ id: string }>,
    res: Response<CommentResponseType[]>,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const commentsDb = await CommentModel.find({ item: id }).populate<{
        user: IUser;
      }>('user');

      const commentsRes: CommentResponseType[] = commentsDb.map(comment => ({
        id: comment._id.toString(),
        item: comment.item.toString(),
        message: comment.message,
        user: { id: comment.user._id.toString(), name: comment.user.name },
        date: comment.createdAt!.toString(),
      }));

      res.send(commentsRes);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
