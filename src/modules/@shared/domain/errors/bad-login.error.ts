export class BadLoginError extends Error {
  constructor(message: string = "Incorrect email address or password") {
    super(message);
    this.name = "BadLoginError";
  }
}
