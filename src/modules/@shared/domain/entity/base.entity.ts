import { Notification } from './validators/notification';
import { DomainEvent } from '../events/domain-event.interface';
import { defaultIdGenerator } from '../id-generator/id-generator';

export interface BaseEntityState {
  id: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | undefined;
}

export default abstract class BaseEntity {
  protected _notification: Notification = new Notification();
  protected _id: string;
  protected _active: boolean;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _deletedAt: Date | undefined;

  private _events: DomainEvent[] = [];

  constructor(
    id: string = defaultIdGenerator.generate(),
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    active: boolean = true,
    deletedAt?: Date,
  ) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._active = active;
    this._deletedAt = deletedAt;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get active(): boolean {
    return this._active;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  get notification(): Notification {
    return this._notification;
  }

  protected addEvent(event: DomainEvent): void {
    this._events.push(event);
  }

  public pullEvents(): DomainEvent[] {
    const events = this._events;
    this._events = [];
    return events;
  }

  public hasPendingEvents(): boolean {
    return this._events.length > 0;
  }

  public activate(): void {
    this._active = true;
    this.update();
  }

  public deactivate(): void {
    this._active = false;
    this.update();
  }

  public update(): void {
    this._updatedAt = new Date();
  }

  public delete(): void {
    this.deactivate();
    this._deletedAt = new Date();
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this._id,
      active: this._active,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
