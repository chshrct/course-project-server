import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import CollectionModel, { ICollection } from '../../models/db/collection.db';
import TopicModel, { ITopic } from '../../models/db/topic.db';
import UserModel, { IUser } from '../../models/db/user.db';
import { STATUS_CODES } from '../../types/status';

import {
  CollectionResponseType,
  CreateCollectionRequestType,
  CreateCollectionResponseType,
  DeleteCollectionRequestType,
  GetTopicsResponseType,
  GetUserCollectionsResponseType,
  UpdateCollectionRequestBodyType,
  UpdateCollectionRequestParamType,
} from './types';

export default {
  getCollection: async (
    req: Request<{ id: string }>,
    res: Response<CollectionResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const userCollectionExists = await CollectionModel.findOne({
        _id: id,
      })
        .populate<{
          topics: ITopic[];
        }>('topics')
        .populate<{
          owner: IUser;
        }>('owner');

      if (!userCollectionExists) return next(new ErrorException(ErrorCode.NotFound));

      const { _id, title, description, image, owner, topics, itemFields } =
        userCollectionExists;

      const collection = {
        id: _id.toString(),
        title,
        description,
        image: image || null,
        owner: { id: owner._id.toString(), name: owner.name },
        topics: topics.map(topic => topic.title),
        itemFields,
      };

      res.send(collection);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  getUserCollections: async (
    req: Request<{ id: string }>,
    res: Response<GetUserCollectionsResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const userCollectionsDb = await CollectionModel.find({
        owner: id,
      })
        .populate<{
          topics: ITopic[];
        }>('topics')
        .populate<{
          owner: IUser;
        }>('owner');
      const userCollections = userCollectionsDb.map(
        ({ _id, title, description, image, owner, topics, itemFields }) => ({
          id: _id.toString(),
          title,
          description,
          image: image || null,
          owner: { id: owner._id.toString(), name: owner.name },
          topics: topics.map(topic => topic.title),
          itemFields,
        }),
      );

      res.send(userCollections);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  createCollection: async (
    req: Request<{}, {}, CreateCollectionRequestType>,
    res: Response<CreateCollectionResponseType>,
    next: NextFunction,
  ) => {
    try {
      const { description, image, itemFields, owner, title, topics } = req.body;
      const collectionWithNameExists = await CollectionModel.findOne({ title });

      if (collectionWithNameExists) {
        return next(
          new ErrorException(ErrorCode.DuplicateCollectionTitleError, { title }),
        );
      }

      const ownerExists = await UserModel.findOne({ _id: owner });

      if (!ownerExists) {
        return next(new ErrorException(ErrorCode.OwnerNotFound, { owner }));
      }

      const topicsDb = await TopicModel.find({ title: { $in: topics } });
      const topicsDbObjectIds = topicsDb.map(
        topic => new mongoose.Types.ObjectId(topic._id),
      );

      const newCollectionObjectId = new mongoose.Types.ObjectId();

      const newCollection: ICollection = {
        _id: newCollectionObjectId,
        title,
        description,
        owner: ownerExists._id,
        topics: topicsDbObjectIds,
        itemFields,
        image,
      };

      await CollectionModel.create(newCollection);

      const createdCollectionExists = await CollectionModel.findOne({
        _id: newCollectionObjectId,
      })
        .populate<{ topics: ITopic[] }>('topics')
        .populate<{
          owner: IUser;
        }>('owner');

      if (!createdCollectionExists)
        return next(new ErrorException(ErrorCode.UnknownError));

      const createdCollection = {
        id: createdCollectionExists._id.toString(),
        title: createdCollectionExists.title,
        description: createdCollectionExists.description,
        image: createdCollectionExists.image || null,
        owner: {
          id: createdCollectionExists.owner._id.toString(),
          name: createdCollectionExists.owner.name,
        },
        topics: createdCollectionExists.topics.map(topic => topic.title),
        itemFields: createdCollectionExists.itemFields,
      };

      res.send(createdCollection);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  updateCollection: async (
    req: Request<UpdateCollectionRequestParamType, {}, UpdateCollectionRequestBodyType>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { title, description, image, topics, itemFields } = req.body;

      const dbPayload = { title, description, itemFields, image };
      const topicsDb = await TopicModel.find({ title: { $in: topics } });

      Object.assign(dbPayload, { topics: topicsDb });
      const updatedCollection = await CollectionModel.findByIdAndUpdate(
        { _id: id },
        dbPayload,
        {
          lean: true,
        },
      );

      res.send(updatedCollection);
    } catch (e) {
      next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
  deleteCollection: async (
    req: Request<DeleteCollectionRequestType>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;

      await CollectionModel.deleteOne({ _id: id });

      res.status(STATUS_CODES.OK).end();
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError));
    }
  },
  getTopics: async (
    req: Request,
    res: Response<GetTopicsResponseType>,
    next: NextFunction,
  ) => {
    try {
      const topics = await TopicModel.find({});
      const topicTitles = topics.map(topic => topic.title);

      res.send(topicTitles);
    } catch (e) {
      return next(new ErrorException(ErrorCode.UnknownError, { e }));
    }
  },
};
