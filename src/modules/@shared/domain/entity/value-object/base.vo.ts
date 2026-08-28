import { Notification } from "../validators/notification";

export default abstract class BaseValueObject<T = unknown> {
  protected _notification: Notification = new Notification();

  get notification(): Notification {
    return this._notification;
  }

  abstract toJSON(): T;
}
