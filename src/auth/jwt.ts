import jwt from 'jsonwebtoken';

import { ErrorCode } from '../error-handler/error-code';
import { ErrorException } from '../error-handler/error-exception';
import { IUser } from '../models/db/user.db';

import { TokenPayloadType } from './types';

const jwtKey = 'gamarjoba';

export const generateAuthToken = (user: IUser): string => {
  const { _id, name, access } = user;
  const token = jwt.sign({ _id, name, access }, jwtKey, {
    expiresIn: '2h',
  });

  return token;
};

export const verifyToken = (token: string): TokenPayloadType => {
  try {
    const tokenPayload = jwt.verify(token, jwtKey);

    return tokenPayload as TokenPayloadType;
  } catch (error) {
    throw new ErrorException(ErrorCode.Unauthenticated);
  }
};
