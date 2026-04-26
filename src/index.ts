import { Sequelize } from "sequelize-typescript";
import { Mediator } from "./domain/@shared/service/mediator";
import CustomerCreatedEvent from "./domain/customer/event/customer-created.event";
import SendConsoleLog1WhenCustomerIsCreatedHandler from "./domain/customer/event/handler/send-console-log-1-when-customer-is-created.handler";
import SendConsoleLog2WhenCustomerIsCreatedHandler from "./domain/customer/event/handler/send-console-log-2-when-customer-is-created.handler";
import { CustomerService } from "./domain/customer/service/customer.service";
import CustomerRepository from "./infrastructure/customer/repository/sequelize/customer.repository";
import CustomerModel from "./infrastructure/customer/repository/sequelize/customer.model";
import { TransactionSequelize } from "./infrastructure/transaction-sequelize";
import Customer from "./domain/customer/entity/customer";

const execution = async () => {
  const mediator = new Mediator();

  const sendConsoleLog1Handler =
    new SendConsoleLog1WhenCustomerIsCreatedHandler();
  const sendConsoleLog2Handler =
    new SendConsoleLog2WhenCustomerIsCreatedHandler();

  mediator.register(CustomerCreatedEvent.name, sendConsoleLog1Handler.handle);
  mediator.register(CustomerCreatedEvent.name, sendConsoleLog2Handler.handle);

  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
    sync: { force: true },
  });

  const repositoryMapper = {
    [Customer.name]: CustomerModel,
  };

  sequelize.addModels([CustomerModel]);
  await sequelize.sync();

  const customerRepository = new CustomerRepository();

  const transaction = new TransactionSequelize({get: async (name: string) => repositoryMapper[name]}, sequelize);

  const customerService = new CustomerService(customerRepository, mediator, transaction);

  await customerService.create("Fernando", "Street", 1, "13330-250", "São Paulo");

  await sequelize.close();
};

execution();
