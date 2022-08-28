export type LikeType = {
  id: string;
  user: string;
  item: string;
};

export type CreateLikeRequestType = Omit<LikeType, 'id'>;

export type DeleteLikeRequestType = Omit<LikeType, 'id'>;

export type DeleteLikeResponseType = { deleted: boolean };

export type GetItemLikesRequestType = { id: string };

export type GetItemLikesResponseType = { users: string[] };
