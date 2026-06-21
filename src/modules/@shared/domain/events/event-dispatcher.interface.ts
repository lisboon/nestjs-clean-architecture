import { DomainEvent } from './domain-event.interface';
import { EventHandlerInterface } from './event-handler.interface';

export interface EventDispatcherInterface {
  dispatch(event: DomainEvent): Promise<void>;
  register(eventName: string, handler: EventHandlerInterface): void;
  has(eventName: string): boolean;
  clear(): void;
}
