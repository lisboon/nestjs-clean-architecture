import { DomainEvent } from './domain-event.interface';

export interface EventHandlerInterface<TDomainEvent extends DomainEvent = DomainEvent> {
  handle(event: TDomainEvent): Promise<void>;
}
