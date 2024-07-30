class GraphqlError extends Error {
  extensions: any;
  constructor(message: string, statusCode: number) {
    super(message);
    this.extensions = {
      statusCode,
    };
  }
}

export class InvalidFileError extends GraphqlError {
  constructor(message: string) {
    super(message, 401);
    this.extensions.errorType = "InvalidFileError";
  }
}

export class InvalidDjError extends GraphqlError {
  constructor(message: string) {
    super(message, 400);
    this.extensions.errorType = "InvalidDjError";
  }
}

export class InvalidPromoError extends GraphqlError {
  constructor(message: string) {
    super(message, 400);
    this.extensions.errorType = "InvalidPromoError";
  }
}

export class InvalidLineupError extends GraphqlError {
  constructor(message: string) {
    super(message, 400);
    this.extensions.errorType = "InvalidLineupError";
  }
}

export class DjNotFoundError extends GraphqlError {
  constructor(message: string) {
    super(message, 404);
    this.extensions.errorType = "DjNotFoundError";
  }
}

export class PromoNotFoundError extends GraphqlError {
  constructor(message: string) {
    super(message, 404);
    this.extensions.errorType = "PromoNotFoundError";
  }
}

export class LineupNotFoundError extends GraphqlError {
  constructor(message: string) {
    super(message, 404);
    this.extensions.errorType = "LineupNotFoundError";
  }
}
