export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE: 'UNPROCESSABLE',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

const STATUS_MAP: Record<ErrorCodeValue, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCodeValue;
  readonly status: number;

  constructor(code: ErrorCodeValue, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_MAP[code];
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(ErrorCode.NOT_FOUND, message);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message);
  }

  static conflict(message: string): AppError {
    return new AppError(ErrorCode.CONFLICT, message);
  }

  static validation(message: string): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message);
  }

  static unprocessable(message: string): AppError {
    return new AppError(ErrorCode.UNPROCESSABLE, message);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(ErrorCode.INTERNAL, message);
  }
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ErrorCodeValue; message: string } };
