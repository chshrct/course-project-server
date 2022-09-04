import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { generateAuthToken } from '../../auth/jwt';
import { comparePassword, passwordHash } from '../../auth/password-hash';
import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import UserModel, { IUser } from '../../models/db/user.db';
import { STATUS_CODES } from '../../types/status';

import {
  AuthCheckResponseBodyType,
  AuthMiddlewareBodyType,
  GithubSignInRequestType,
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
    const userWithEmailExists = await UserModel.findOne({ email });

    if (userWithEmailExists) {
      return next(new ErrorException(ErrorCode.DuplicateEmailError, { email }));
    }
    const userWithNameExists = await UserModel.findOne({ name });

    if (userWithNameExists) {
      return next(new ErrorException(ErrorCode.DuplicateUserNameError, { name }));
    }

    const hashedPassword = passwordHash(password);
    const newUser: IUser = {
      _id: new mongoose.Types.ObjectId(),
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
    const { email, password, googleData } = req.body;

    let userExists = await UserModel.findOne({ email });

    if (!userExists) {
      if (googleData) {
        const { name } = googleData;
        const hashedPassword = passwordHash(password);

        userExists = await UserModel.create({
          _id: new mongoose.Types.ObjectId(),
          email,
          name,
          password: hashedPassword,
          access: 'basic',
          status: 'active',
        });
      } else {
        return next(new ErrorException(ErrorCode.Unauthenticated));
      }
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
      id: userExists._id.toString(),
      name: userExists.name,
      access: userExists.access,
      token,
    });
  },
  githubSignIn: async (
    req: Request<{}, {}, GithubSignInRequestType>,
    res: Response<SignInResponseBodyType>,
    next: NextFunction,
  ) => {
    try {
      const { code } = req.body;

      const gitAccessTokenData = await axios.post(
        `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_SECRET}&code=${code}`,
        {},
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const {
        data: { email, node_id: password, name },
      } = await axios.get(`https://api.github.com/user`, {
        headers: {
          Authorization: `Bearer ${gitAccessTokenData.data.access_token}`,
          Accept: 'application/json',
        },
      });

      let userExists = await UserModel.findOne({ email });

      if (!userExists) {
        const hashedPassword = passwordHash(password);

        userExists = await UserModel.create({
          _id: new mongoose.Types.ObjectId(),
          email,
          name,
          password: hashedPassword,
          access: 'basic',
          status: 'active',
        });
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
        id: userExists._id.toString(),
        name: userExists.name,
        access: userExists.access,
        token,
      });
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
