import { Model, Sequelize } from "sequelize-typescript";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import { TransactionSequelize } from "../../../infrastructure/transaction-sequelize";
import { Mediator } from "../../@shared/service/mediator";
import CustomerModel from "../../../infrastructure/customer/repository/sequelize/customer.model";
import { CustomerService } from "./customer.service";
import Customer from "../entity/customer";
import CustomerCreatedEvent from "../event/customer-created.event";
import SendConsoleLog1WhenCustomerIsCreatedHandler from "../event/handler/send-console-log-1-when-customer-is-created.handler";
import SendConsoleLog2WhenCustomerIsCreatedHandler from "../event/handler/send-console-log-2-when-customer-is-created.handler";

describe("CustomerService", () => {
  let sequelize: Sequelize;
  const modelsMapper: Record<string, typeof Model> = {
    [Customer.name]: CustomerModel,
  };

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([CustomerModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });
  it("should create a customer and publish CustomerCreated event", async () => {
    jest.useFakeTimers();
    const createdAt = new Date();
    jest.setSystemTime(createdAt);
    const realConsoleLog = console.log;
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation((...args) => realConsoleLog(...args));
    const mediator = new Mediator();

    const sendConsoleLog1Handler =
      new SendConsoleLog1WhenCustomerIsCreatedHandler();
    const sendConsoleLog2Handler =
      new SendConsoleLog2WhenCustomerIsCreatedHandler();

    mediator.register(CustomerCreatedEvent.name, sendConsoleLog1Handler.handle);
    mediator.register(CustomerCreatedEvent.name, sendConsoleLog2Handler.handle);

    const transaction = new TransactionSequelize(
      { get: async (name: string) => modelsMapper[name] },
      sequelize
    );
    const customerRepository = new CustomerRepository();

    const customerService = new CustomerService(
      customerRepository,
      mediator,
      transaction
    );

    const customer = await customerService.create(
      "Fernando",
      "Street",
      1,
      "13330-250",
      "São Paulo"
    );
    expect(customer).toBeInstanceOf(Customer);
    expect(customer.name).toBe("Fernando");
    expect(customer.id).toBeDefined();
    const eventsArray = Array.from(customer.events);
    expect(eventsArray.length).toBe(1);
    const event = eventsArray[0];
    expect(event).toBeInstanceOf(CustomerCreatedEvent);
    expect(event.eventData).toEqual({ id: customer.id, name: customer.name });
    expect(event.dataTimeOccurred).toEqual(createdAt);
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledWith(
      `Esse é o primeiro console.log do evento: CustomerCreated`
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      `Esse é o segundo console.log do evento: CustomerCreated`
    );
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });
});
