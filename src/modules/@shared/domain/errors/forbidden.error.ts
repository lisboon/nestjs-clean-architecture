export class ForbiddenError extends Error {
  public status = 403;

  constructor(message: string = 'Access to this resource is forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
