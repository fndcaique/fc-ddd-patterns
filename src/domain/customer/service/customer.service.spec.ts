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
import CustomerAddressChangedEvent from "../event/customer-address-changed.event";
import SendConsoleLogWhenAddressIsChangedHandler from "../event/handler/send-console-log-when-address-is-changed.handler";

describe("CustomerService", () => {
  let sequelize: Sequelize;
  let mediator: Mediator;
  let customerService: CustomerService;
  let customerRepository: CustomerRepository;
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
    mediator = new Mediator();
    const transaction = new TransactionSequelize(
      { get: async (name: string) => modelsMapper[name] },
      sequelize
    );
    customerRepository = new CustomerRepository();

    customerService = new CustomerService(
      customerRepository,
      mediator,
      transaction
    );
  });

  afterEach(async () => {
    await sequelize.close();
  });
  it("should create a customer and publish CustomerCreated event", async () => {
    jest.useFakeTimers();
    const createdAt = new Date();
    jest.setSystemTime(createdAt);
    const consoleSpy = jest
      .spyOn(console, "log")

    const sendConsoleLog1Handler =
      new SendConsoleLog1WhenCustomerIsCreatedHandler();
    const sendConsoleLog2Handler =
      new SendConsoleLog2WhenCustomerIsCreatedHandler();

    mediator.register(CustomerCreatedEvent.name, sendConsoleLog1Handler.handle);
    mediator.register(CustomerCreatedEvent.name, sendConsoleLog2Handler.handle);

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

  it("should change customer address and publish CustomerAddressChanged event", async () => {

    const customer = await customerService.create(
      "Fernando",
      "Street",
      1,
      "13330-250",
      "São Paulo"
    );

    const consoleSpy = jest
      .spyOn(console, "log")

    const eventDate = new Date();
    jest.useFakeTimers();
    jest.setSystemTime(eventDate);

    const sendConsoleLogWhenAddressIsChangedHandler = new SendConsoleLogWhenAddressIsChangedHandler();

    mediator.register(CustomerAddressChangedEvent.name, sendConsoleLogWhenAddressIsChangedHandler.handle);

    await customerService.changeAddress(
      customer.id,
      "New Street",
      123,
      "19590-000",
      "Taciba"
    );

    const updatedCustomer = await customerRepository.find(customer.id);
    expect(updatedCustomer.address.street).toBe("New Street");
    expect(updatedCustomer.address.number).toBe(123);
    expect(updatedCustomer.address.zip).toBe("19590-000");
    expect(updatedCustomer.address.city).toBe("Taciba");

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${updatedCustomer.address}`
    );
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });
});
