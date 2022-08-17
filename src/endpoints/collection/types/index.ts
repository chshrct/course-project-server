import { FieldType } from '../../../models/db/collection.db';

export type CollectionType = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  owner: string;
  topics: string[];
  itemFields: FieldType[];
};

export type GetUserCollectionsResponseType = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  owner: { id: string; name: string };
  topics: string[];
  itemFields: FieldType[];
}[];

export type CreateCollectionRequestType = Omit<CollectionType, 'id'>;

export type CreateCollectionResponseType = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  owner: { id: string; name: string };
  topics: string[];
  itemFields: FieldType[];
};

export type GetTopicsResponseType = string[];

export type DeleteCollectionRequestType = { id: string };

export type UpdateCollectionRequestParamType = { id: string };
export type UpdateCollectionRequestBodyType = {
  title: string;
  description: string;
  image: string | null;
  topics: string[];
  itemFields: FieldType[];
};
export type UpdateCollectionResponseType = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  owner: { id: string; name: string };
  topics: string[];
  itemFields: FieldType[];
};
