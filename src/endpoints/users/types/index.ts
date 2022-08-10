import { UserAccessType, UserStatusType } from '../../../models/db/types';

export type UserType = {
  id: string;
  name: string;
  email: string;
  access: UserAccessType;
  status: UserStatusType;
};

export type GetAllUsersRequestQueryType = {
  page: string;
  limit: string;
};

export type GetAllUsersResponseBodyType = {
  users: UserType[];
  count: number;
};

export type UpdateUsersStatusRequestBodyType = GetAllUsersRequestQueryType & {
  userIds: string[];
  status: UserStatusType;
};
export type UpdateUsersAccessRequestBodyType = GetAllUsersRequestQueryType & {
  userIds: string[];
  access: UserAccessType;
};
export type DeleteUsersRequestBodyType = GetAllUsersRequestQueryType & {
  userIds: string[];
};
