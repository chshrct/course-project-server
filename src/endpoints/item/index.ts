import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import { ICollection } from '../../models/db/collection.db';
import ItemModel, { IItem } from '../../models/db/item.db';
import TagModel, { ITag } from '../../models/db/tag.db';

import {
  CreateItemRequestType,
  CreateItemResponseType,
  DeleteItemsRequestType,
  GetCollectionItemsRequestQueryType,
  GetCollectionItemsResponseType,
  ItemType,
  UpdateItemRequestBodyType,
} from './types';

const DEFAULT_PAGE_LIMIT = 5;

export default {
  getCollectionItems: async (
    req: Request<{ id: string }, {}, {}, GetCollectionItemsRequestQueryType>,
    res: Response<GetCollectionItemsResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { limit = DEFAULT_PAGE_LIMIT, page = 1 } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const itemsDb = await ItemModel.find({ collections: id })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .populate<{
          tags: ITag[];
        }>('tags')
        .exec();

      const count = await ItemModel.countDocuments({ collections: id });

      const items = itemsDb.map(item => ({
        id: item._id.toString(),
        title: item.title,
        itemFields: item.itemFields.map(({ title, type, value }) => ({
          title,
          type,
          value,
        })),
        tags: item.tags.map(tag => tag.title),
      }));

      res.send({ items, count });
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  getItem: async (
    req: Request<{ id: string }>,
    res: Response<ItemType>,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      const itemDb = await ItemModel.findById(id)
        .populate<{ tags: ITag[] }>('tags')
        .populate<{ collections: ICollection }>('collections');

      if (!itemDb) return next(new ErrorException(ErrorCode.NotFound));

      const item: ItemType = {
        id: itemDb._id.toString(),
        collection: itemDb.collections._id.toString(),
        itemFields: itemDb.itemFields,
        tags: itemDb.tags.map(tag => tag.title),
        title: itemDb.title,
      };

      res.send(item);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  createItem: async (
    req: Request<{}, {}, CreateItemRequestType>,
    res: Response<CreateItemResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { title, tags, itemFields, collection } = req.body.item;

      const tagsDbObjectIds = await Promise.all(
        tags.map(async tag => {
          const tagDb = await TagModel.findOne({ title: tag });

          if (tagDb) return tagDb._id;
          const newTag = await TagModel.create({
            _id: new mongoose.Types.ObjectId(),
            title: tag,
          });

          return newTag._id;
        }),
      );

      const itemObjectId = new mongoose.Types.ObjectId();
      const collectionObjectId = new mongoose.Types.ObjectId(collection);

      const newItem: IItem = {
        _id: itemObjectId,
        title,
        tags: tagsDbObjectIds,
        collections: collectionObjectId,
        itemFields,
      };

      await ItemModel.create(newItem);
      const createdItemExists = await ItemModel.findOne({
        _id: itemObjectId,
      }).populate<{ tags: ITag[] }>('tags');

      if (!createdItemExists) return next(new ErrorException(ErrorCode.UnknownError));
      const createdItem: CreateItemResponseType = {
        id: createdItemExists._id.toString(),
        title: createdItemExists.title,
        collection: createdItemExists.collections._id.toString(),
        itemFields: createdItemExists.itemFields,
        tags: createdItemExists.tags.map(tag => tag.title),
      };

      res.send(createdItem);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError));
    }
  },
  updateItem: async (
    req: Request<{ id: string }, {}, UpdateItemRequestBodyType>,
    res: Response<CreateItemResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { title, tags, itemFields } = req.body;
      const { id } = req.params;

      const tagsDbObjectIds = await Promise.all(
        tags.map(async tag => {
          const tagDb = await TagModel.findOne({ title: tag });

          if (tagDb) return tagDb._id;
          const newTag = await TagModel.create({
            _id: new mongoose.Types.ObjectId(),
            title: tag,
          });

          return newTag._id;
        }),
      );

      const updatePayload = {
        title,
        tags: tagsDbObjectIds,
        itemFields,
      };

      await ItemModel.findByIdAndUpdate(id, updatePayload);
      const updatedItemExists = await ItemModel.findOne({
        _id: id,
      }).populate<{ tags: ITag[] }>('tags');

      if (!updatedItemExists) return next(new ErrorException(ErrorCode.UnknownError));
      const updatedItem: CreateItemResponseType = {
        id: updatedItemExists._id.toString(),
        title: updatedItemExists.title,
        collection: updatedItemExists.collections._id.toString(),
        itemFields: updatedItemExists.itemFields,
        tags: updatedItemExists.tags.map(tag => tag.title),
      };

      res.send(updatedItem);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, e));
    }
  },
  deleteItems: async (
    req: Request<{}, {}, DeleteItemsRequestType>,
    res: Response<{ deleted: string[] }>,
    next: NextFunction,
  ) => {
    try {
      await ItemModel.deleteMany({ _id: { $in: req.body.itemIds } });
      res.send({ deleted: req.body.itemIds });
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
