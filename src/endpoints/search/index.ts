import { NextFunction, Request, Response } from 'express';

import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import CollectionModel, { ICollection } from '../../models/db/collection.db';
import CommentModel, { IComment } from '../../models/db/comment.db';
import ItemModel, { IItem } from '../../models/db/item.db';
import UserModel from '../../models/db/user.db';

import { HighlightType, SearchByQueryRequest, SearchByQueryResponse } from './types';

export default {
  searchByQuery: async (
    req: Request<{}, {}, {}, SearchByQueryRequest>,
    res: Response<SearchByQueryResponse>,
    next: NextFunction,
  ) => {
    try {
      const searchAnswerCount = 5;
      const { query } = req.query;

      const result: SearchByQueryResponse = [];

      const searchItemsResult = await ItemModel.aggregate<
        IItem & { highlights: HighlightType[] }
      >([
        {
          $search: {
            index: 'items_text',
            text: {
              query,
              path: ['title', 'itemFields.value'],
              fuzzy: {
                maxEdits: 1,
              },
            },
            highlight: {
              path: ['title', 'itemFields.value'],
            },
          },
        },
      ])
        .addFields({
          highlights: {
            $meta: 'searchHighlights',
          },
        })
        .limit(searchAnswerCount);

      const searchCollectionsResult = await CollectionModel.aggregate<
        ICollection & { highlights: HighlightType[] }
      >([
        {
          $search: {
            index: 'collections_text',
            text: {
              query,
              path: ['title', 'description'],
              fuzzy: {
                maxEdits: 1,
              },
            },
            highlight: {
              path: ['title', 'description'],
            },
          },
        },
      ])
        .addFields({
          highlights: {
            $meta: 'searchHighlights',
          },
        })
        .limit(searchAnswerCount);

      const searchCommentsResult = await CommentModel.aggregate<
        IComment & { highlights: HighlightType[] }
      >([
        {
          $search: {
            index: 'comments_text',
            text: {
              query,
              path: 'message',
              fuzzy: {
                maxEdits: 1,
              },
            },
            highlight: {
              path: 'message',
            },
          },
        },
      ])
        .addFields({
          highlights: {
            $meta: 'searchHighlights',
          },
        })
        .limit(searchAnswerCount);

      searchItemsResult.forEach(({ _id, title, highlights }) => {
        result.push({
          id: _id.toString(),
          title,
          highlight: highlights.sort((a, b) => b.score - a.score)[0],
          type: 'Item',
        });
      });

      searchCollectionsResult.forEach(({ _id, title, highlights }) => {
        result.push({
          id: _id.toString(),
          title,
          highlight: highlights.sort((a, b) => b.score - a.score)[0],
          type: 'Collection',
        });
      });

      const mappedComments = await Promise.all(
        searchCommentsResult.map(async ({ item, user, highlights }) => {
          const userDb = await UserModel.findById(user);

          return {
            id: item.toString(),
            title: userDb ? userDb.name : '',
            highlight: highlights.sort((a, b) => b.score - a.score)[0],
          };
        }),
      );

      mappedComments.forEach(comment => {
        result.push({ ...comment, type: 'Comment' });
      });
      result.sort((a, b) => b.highlight.score - a.highlight.score);

      res.send(result);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
