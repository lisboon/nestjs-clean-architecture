export class NotFoundError extends Error {
  constructor(identifier: string, entity?: { name: string }) {
    const message = entity
      ? `${entity.name} not found: ${identifier}`
      : `Resource not found: ${identifier}`;
    super(message);
    this.name = "NotFoundError";
  }
}
