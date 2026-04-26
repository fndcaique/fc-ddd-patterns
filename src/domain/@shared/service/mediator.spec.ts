import { AgreggateRoot } from "../domain/aggregate-root";
import EventInterface from "../event/event.interface";
import { Mediator } from "./mediator";

class DumbEvent implements EventInterface {
  eventData: any;
  dateTimeOccurred: Date;
  constructor(eventData: any) {
    this.eventData = eventData;
    this.dateTimeOccurred = new Date();
  }
}

class DumbAggregateRoot extends AgreggateRoot {
  doSomething() {
    this.addEvent(new DumbEvent({ message: "Evento criado" }));
  }
}

describe("Mediator", () => {
  it("should register and publish events", async () => {
    const mediator = new Mediator();
    const eventData = { message: "Evento criado" };
    const eventHandler = jest.fn();
    mediator.register(DumbEvent.name, eventHandler);

    jest.useFakeTimers();
    const eventDate = new Date();
    jest.setSystemTime(eventDate);

    const dumbAggregateRoot = new DumbAggregateRoot();
    dumbAggregateRoot.doSomething();
    await mediator.publish(dumbAggregateRoot);

    expect(eventHandler).toHaveBeenCalledWith(
      expect.objectContaining({ dateTimeOccurred: eventDate, eventData })
    );
  });

  it("should clear events after publishing", async () => {
    const mediator = new Mediator();
    
    const dumbAggregateRoot = new DumbAggregateRoot();
    dumbAggregateRoot.doSomething();

    await mediator.publish(dumbAggregateRoot);

    expect(dumbAggregateRoot.events.size).toBe(0);
  });
});
