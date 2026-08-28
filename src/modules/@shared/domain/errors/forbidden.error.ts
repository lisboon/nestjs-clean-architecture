export class ForbiddenError extends Error {
  constructor(message: string = "Access to this resource is forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}
