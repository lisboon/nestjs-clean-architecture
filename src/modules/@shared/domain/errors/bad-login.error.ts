export class BadLoginError extends Error {
  public status: number;

  constructor(message: string = 'Incorrect email address or password') {
    super(message);
    this.name = 'BadLoginError';
    this.status = 400;
  }
}
