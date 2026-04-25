import CustomerCreatedEvent from "../event/customer-created.event";

export class SendMailListener {
  handle(event: CustomerCreatedEvent) {
    //envio do email
  }
}
