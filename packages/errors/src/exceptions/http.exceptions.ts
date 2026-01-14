import { BaseException } from './base.exception';

// 4xx Client Errors
export class BadRequestException extends BaseException {
  constructor(message: string = 'Bad Request', details?: any) {
    super(message, 400, 'Bad Request', details);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, 'Unauthorized', details);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, 'Forbidden', details);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = 'Not Found', details?: any) {
    super(message, 404, 'Not Found', details);
  }
}

export class MethodNotAllowedException extends BaseException {
  constructor(message: string = 'Method Not Allowed', details?: any) {
    super(message, 405, 'Method Not Allowed', details);
  }
}

export class ConflictException extends BaseException {
  constructor(message: string = 'Conflict', details?: any) {
    super(message, 409, 'Conflict', details);
  }
}

export class UnprocessableEntityException extends BaseException {
  constructor(message: string = 'Unprocessable Entity', details?: any) {
    super(message, 422, 'Unprocessable Entity', details);
  }
}

export class TooManyRequestsException extends BaseException {
  constructor(message: string = 'Too Many Requests', details?: any) {
    super(message, 429, 'Too Many Requests', details);
  }
}

// 5xx Server Errors
export class InternalServerErrorException extends BaseException {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, 'Internal Server Error', details);
  }
}

export class NotImplementedException extends BaseException {
  constructor(message: string = 'Not Implemented', details?: any) {
    super(message, 501, 'Not Implemented', details);
  }
}

export class BadGatewayException extends BaseException {
  constructor(message: string = 'Bad Gateway', details?: any) {
    super(message, 502, 'Bad Gateway', details);
  }
}

export class ServiceUnavailableException extends BaseException {
  constructor(message: string = 'Service Unavailable', details?: any) {
    super(message, 503, 'Service Unavailable', details);
  }
}

export class GatewayTimeoutException extends BaseException {
  constructor(message: string = 'Gateway Timeout', details?: any) {
    super(message, 504, 'Gateway Timeout', details);
  }
}
