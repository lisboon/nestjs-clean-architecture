export class NotFoundError extends Error {
  public status = 404;

  constructor(identifier: string, entity?: { name: string }) {
    const message = entity
      ? `${entity.name} not found: ${identifier}`
      : `Resource not found: ${identifier}`;
    super(message);
    this.name = 'NotFoundError';
  }
}
