import { NextFunction, Request, Response } from 'express';

import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import TagModel from '../../models/db/tag.db';

export default {
  getTags: async (req: Request, res: Response<string[]>, next: NextFunction) => {
    try {
      const tagsDb = await TagModel.find({});
      const tags = tagsDb.map(tag => tag.title);

      res.send(tags);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
