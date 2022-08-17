import { STATUS_CODES } from '../types/status';

import { ErrorCode } from './error-code';

export class ErrorException extends Error {
  public status: number | null = null;

  public metaData: any = null;

  constructor(code: string = ErrorCode.UnknownError, metaData: any = null) {
    super(code);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = code;
    this.status = STATUS_CODES.UNKNOWN_ERROR;
    this.metaData = metaData;
    switch (code) {
      case ErrorCode.Unauthenticated:
      case ErrorCode.Blocked:
      case ErrorCode.NotAllowed:
        this.status = STATUS_CODES.UNAUTHORIZED;
        break;
      case ErrorCode.MaximumAllowedGrade:
      case ErrorCode.DuplicateEmailError:
      case ErrorCode.DuplicateUserNameError:
      case ErrorCode.DuplicateCollectionTitleError:
      case ErrorCode.OwnerNotFound:
        this.status = STATUS_CODES.BAD_REQUEST;
        break;
      case ErrorCode.AsyncError:
        this.status = STATUS_CODES.BAD_REQUEST;
        break;
      case ErrorCode.NotFound:
        this.status = STATUS_CODES.NOT_FOUND;
        break;
      default:
        this.status = STATUS_CODES.UNKNOWN_ERROR;
        break;
    }
  }
}
