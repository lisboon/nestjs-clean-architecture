import { ValidationError } from "../entity/validators/notification";

const DEFAULT_MESSAGE =
  "The request could not be processed with the provided parameters";

export abstract class BaseValidationError extends Error {
  constructor(
    public error: ValidationError[],
    message = DEFAULT_MESSAGE,
  ) {
    super(message);
    this.name = "BaseValidationError";
  }

  count(): number {
    return this.error.length;
  }
}

export class EntityValidationError extends BaseValidationError {
  constructor(error: ValidationError[]) {
    super(error);
    this.name = "EntityValidationError";
  }
}
