export class ErrorCode {
  public static readonly Unauthenticated = 'Account doesnt exist';

  public static readonly Blocked = 'Account is blocked';

  public static readonly DuplicateEmailError = 'Email allready taken';

  public static readonly NotAllowed = 'You are not allowed to access this resource';

  public static readonly NotFound = 'NotFound';

  public static readonly MaximumAllowedGrade = 'MaximumAllowedGrade';

  public static readonly AsyncError = 'AsyncError';

  public static readonly UnknownError = 'UnknownError';
}
