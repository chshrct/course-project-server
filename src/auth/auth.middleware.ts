import { Request, Response, NextFunction } from 'express';

import { ErrorCode } from '../error-handler/error-code';
import { ErrorException } from '../error-handler/error-exception';
import UserModel from '../models/db/user.db';

import { verifyToken } from './jwt';

const TOKEN_START_INDEX = 7;

export const authMiddleware = (withAccessControl: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const auth = req.headers.authorization;

    if (auth && auth.startsWith('Bearer')) {
      const token = auth.slice(TOKEN_START_INDEX);

      try {
        const tokenPayload = verifyToken(token);
        const { _id } = tokenPayload;

        const userExists = await UserModel.findOne({ _id });

        if (!userExists) {
          return next(new ErrorException(ErrorCode.Unauthenticated));
        }
        if (userExists.status === 'blocked') {
          return next(new ErrorException(ErrorCode.Blocked));
        }
        if (withAccessControl && userExists.access === 'basic') {
          return next(new ErrorException(ErrorCode.NotAllowed));
        }
        // eslint-disable-next-line no-param-reassign
        req.body.tokenPayload = tokenPayload;
        next();
      } catch (error) {
        return next(new ErrorException(ErrorCode.Unauthenticated));
      }
    } else {
      return next(new ErrorException(ErrorCode.Unauthenticated));
    }
  };
};
