export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthenticated request") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
