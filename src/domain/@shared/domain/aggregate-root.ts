import EventInterface from "../event/event.interface";

export abstract class AgreggateRoot {
  events: Set<EventInterface> = new Set();

  addEvent(event: EventInterface) {
    this.events.add(event);
  }

  clearEvents() {
    this.events.clear();
  }
}
