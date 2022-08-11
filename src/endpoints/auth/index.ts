import { NextFunction, Request, Response } from 'express';
import { ulid } from 'ulid';

import { generateAuthToken } from '../../auth/jwt';
import { comparePassword, passwordHash } from '../../auth/password-hash';
import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import UserModel, { IUser } from '../../models/db/user.db';
import { STATUS_CODES } from '../../types/status';

import {
  AuthCheckResponseBodyType,
  AuthMiddlewareBodyType,
  SignInRequestBodyType,
  SignInResponseBodyType,
  SignUpRequestBodyType,
} from './types';

export default {
  check: async (
    req: Request<{}, {}, AuthMiddlewareBodyType>,
    res: Response<AuthCheckResponseBodyType>,
    next: NextFunction,
  ) => {
    const { _id } = req.body.tokenPayload;

    const userExists = await UserModel.findOne({ _id });

    if (!userExists) {
      return next(new ErrorException(ErrorCode.Unauthenticated));
    }

    res.send({
      id: _id,
      name: userExists.name,
      access: userExists.access,
    });
  },
  signUp: async (
    req: Request<{}, {}, SignUpRequestBodyType>,
    res: Response,
    next: NextFunction,
  ) => {
    const { email, name, password } = req.body;
    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      return next(new ErrorException(ErrorCode.DuplicateEmailError, { email }));
    }

    const hashedPassword = passwordHash(password);
    const newUser: IUser = {
      _id: ulid(),
      email,
      name,
      password: hashedPassword,
      access: 'basic',
      status: 'active',
    };

    await UserModel.create(newUser);

    res.status(STATUS_CODES.OK).end();
  },
  signIn: async (
    req: Request<{}, {}, SignInRequestBodyType>,
    res: Response<SignInResponseBodyType>,
    next: NextFunction,
  ) => {
    const { email, password } = req.body;

    const userExists = await UserModel.findOne({ email });

    if (!userExists) {
      return next(new ErrorException(ErrorCode.Unauthenticated));
    }
    if (userExists.status === 'blocked') {
      return next(new ErrorException(ErrorCode.Blocked));
    }

    const validPassword = comparePassword(password, userExists.password);

    if (!validPassword) {
      return next(new ErrorException(ErrorCode.Unauthenticated));
    }

    const token = generateAuthToken(userExists);

    res.send({
      id: userExists._id,
      name: userExists.name,
      access: userExists.access,
      token,
    });
  },
};
