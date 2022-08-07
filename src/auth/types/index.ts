import { UserAccessType } from '../../models/db/types';

export type TokenPayloadType = { _id: string; name: string; access: UserAccessType };
