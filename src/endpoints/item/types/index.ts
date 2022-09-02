import { ItemFieldType } from '../../../models/db/item.db';

export type ItemType = {
  id: string;
  title: string;
  collection: string;
  tags: string[];
  itemFields: ItemFieldType[];
};

export type CreateItemRequestType = { item: Omit<ItemType, 'id'> };
export type CreateItemResponseType = ItemType;

export type UpdateItemRequestBodyType = Omit<ItemType, 'id' | 'collection'>;
export type UpdateItemResponseType = ItemType;

export type GetCollectionItemsResponseType = {
  items: {
    id: string;
    title: string;
    tags: string[];
    itemFields: ItemFieldType[];
  }[];
  count: number;
};

export type GetCollectionItemsRequestQueryType = {
  page: string;
  limit: string;
};

export type DeleteItemsRequestType = {
  itemIds: string[];
};

export type GetTenLatestResponse = {
  item: { id: string; title: string };
  collection: { id: string; title: string; image: string | null };
  owner: { id: string; title: string };
}[];

export type GetItemsByTagResponse = {
  items: {
    item: { id: string; title: string };
    collection: { id: string; title: string; image: string | null };
    owner: { id: string; title: string };
  }[];
  count: number;
};
