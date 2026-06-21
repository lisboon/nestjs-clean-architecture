import { DomainEvent } from './domain-event.interface';
import { EventDispatcherInterface } from './event-dispatcher.interface';
import { EventHandlerInterface } from './event-handler.interface';

export class EventDispatcher implements EventDispatcherInterface {
  private handlers: Map<string, EventHandlerInterface[]> = new Map();

  register(eventName: string, handler: EventHandlerInterface): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];
    await Promise.all(handlers.map((h) => h.handle(event)));
  }

  has(eventName: string): boolean {
    return this.handlers.has(eventName);
  }

  clear(): void {
    this.handlers.clear();
  }
}
