import { NextFunction, Request, Response } from 'express';

import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import ItemModel from '../../models/db/item.db';
import TagModel from '../../models/db/tag.db';

type GetTagsResponse = { value: string; count: number }[];

export default {
  getTags: async (req: Request, res: Response<GetTagsResponse>, next: NextFunction) => {
    try {
      const tagsDb = await TagModel.find({});
      const tags = await Promise.all(
        tagsDb.map(async tag => ({
          value: tag.title,
          count: await ItemModel.find({ tags: tag._id }).count(),
        })),
      );

      res.send(tags);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
