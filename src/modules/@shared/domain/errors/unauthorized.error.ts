export class UnauthorizedError extends Error {
  public status = 401;

  constructor(message: string = 'Unauthenticated request') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
