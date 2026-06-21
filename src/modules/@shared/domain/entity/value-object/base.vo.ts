import { Notification } from '../validators/notification';

export default abstract class BaseValueObject {
  protected _notification: Notification = new Notification();

  get notification(): Notification {
    return this._notification;
  }

  abstract toJSON(): any;
}
