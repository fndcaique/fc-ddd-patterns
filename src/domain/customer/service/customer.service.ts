import { v4 as uuid } from "uuid";
import CustomerRepository from "../../../infrastructure/customer/repository/sequelize/customer.repository";
import { TransactionInterface } from "../../@shared/domain/transaction.interface";
import { Mediator } from "../../@shared/service/mediator";
import Customer from "../entity/customer";
import address from "../value-object/address";

export class CustomerService {
  constructor(
    private customerRepo: CustomerRepository,
    private mediator: Mediator,
    private transaction: TransactionInterface
  ) {}

  async create(
    name: string,
    street: string,
    number: number,
    zip: string,
    city: string
  ): Promise<Customer> {
    const customer = Customer.create(
      uuid(),
      name,
      new address(street, number, zip, city)
    );
    await this.transaction.do(async (transaction) => {
      this.customerRepo.setTransaction(transaction);
      await this.customerRepo.create(customer);
    });
    await this.mediator.publish(customer);
    return customer;
  }

  async changeAddress(
    customerId: string,
    street: string,
    number: number,
    zip: string,
    city: string
  ): Promise<void> {
    const customer = await this.customerRepo.find(customerId);
    if (!customer) {
      throw new Error("Cliente não encontrado");
    }
    customer.changeAddress(new address(street, number, zip, city));
    await this.transaction.do(async (transaction) => {
      this.customerRepo.setTransaction(transaction);
      await this.customerRepo.update(customer);
    });
    await this.mediator.publish(customer);
  }
}
