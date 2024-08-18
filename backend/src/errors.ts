class GraphqlError extends Error {
  extensions: any;
  constructor(message: string, statusCode: number, errorType: string) {
    super(message);
    this.extensions = {
      statusCode,
      errorType,
    };
  }
}

export const invalidFileError = (message: string) =>
  new GraphqlError(message, 400, "invalidFileError");

export const invalidThemeError = (message: string) =>
  new GraphqlError(message, 400, "invalidThemeError");

export const invalidEventError = (message: string) =>
  new GraphqlError(message, 400, "invalidEventError");

export const invalidPromoError = (message: string) =>
  new GraphqlError(message, 400, "invalidPromoError");

export const invalidDjError = (message: string) =>
  new GraphqlError(message, 400, "invalidDjError");

export const invalidActionError = (message: string) =>
  new GraphqlError(message, 400, "invalidActionError");

export const invalidAppThemeError = (message: string) =>
  new GraphqlError(message, 400, "invalidAppThemeError");

export const fileNotFoundError = (message: string) =>
  new GraphqlError(message, 404, "fileNotFoundError");

export const themeNotFoundError = (message: string) =>
  new GraphqlError(message, 404, "themeNotFoundError");

export const eventNotFoundError = (message: string) =>
  new GraphqlError(message, 404, "eventNotFoundError");

export const promoNotFoundError = (message: string) =>
  new GraphqlError(message, 404, "promoNotFoundError");

export const djNotFoundError = (message: string) =>
  new GraphqlError(message, 404, "djNotFoundError");

export const appThemeNotFoundError = (message: string) =>
  new GraphqlError(message, 404, "appThemeNotFoundError");

export const sqlEntryNotFound = (message: string) =>
  new GraphqlError(message, 404, "sqlEntryNotFound");

export const importError = (message: string) =>
  new GraphqlError(message, 500, "importError");
