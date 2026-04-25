import { Mediator } from "./domain/@shared/service/mediator";
import CustomerCreatedEvent from "./domain/customer/event/customer-created.event";
import { SendMailListener } from "./domain/customer/listeners/send-mail.listener";

const mediator = new Mediator();

const sendMailListener = new SendMailListener();

mediator.register(CustomerCreatedEvent.name, (event: CustomerCreatedEvent) => {
  sendMailListener.handle(event);
});
