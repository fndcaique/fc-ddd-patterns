import { TransactionInterface } from "../../../../domain/@shared/domain/transaction.interface";
import Customer from "../../../../domain/customer/entity/customer";
import CustomerRepositoryInterface from "../../../../domain/customer/repository/customer-repository.interface";
import Address from "../../../../domain/customer/value-object/address";
import CustomerModel from "./customer.model";

export default class CustomerRepository implements CustomerRepositoryInterface {
  private transaction: TransactionInterface | undefined = undefined;

  setTransaction(transaction: TransactionInterface): void {
    this.transaction = transaction;
  }

  async create(entity: Customer): Promise<void> {
    await CustomerModel.create(
      {
        id: entity.id,
        name: entity.name,
        street: entity.address.street,
        number: entity.address.number,
        zipcode: entity.address.zip,
        city: entity.address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      { transaction: this.transaction?.getTransaction() }
    );
  }

  async update(entity: Customer): Promise<void> {
    await CustomerModel.update(
      {
        name: entity.name,
        street: entity.address.street,
        number: entity.address.number,
        zipcode: entity.address.zip,
        city: entity.address.city,
        active: entity.isActive(),
        rewardPoints: entity.rewardPoints,
      },
      {
        where: {
          id: entity.id,
        },
        transaction: this.transaction?.getTransaction(),
      }
    );
  }

  async find(id: string): Promise<Customer> {
    let customerModel;
    try {
      customerModel = await CustomerModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
        transaction: this.transaction?.getTransaction(),
      });
    } catch (error) {
      throw new Error("Customer not found");
    }

    const customer = new Customer(
      id,
      customerModel.name,
      new Address(
        customerModel.street,
        customerModel.number,
        customerModel.zipcode,
        customerModel.city
      )
    );
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    const customerModels = await CustomerModel.findAll({
      transaction: this.transaction?.getTransaction(),
    });

    const customers = customerModels.map((customerModels) => {
      const customer = new Customer(
        customerModels.id,
        customerModels.name,
        new Address(
          customerModels.street,
          customerModels.number,
          customerModels.zipcode,
          customerModels.city
        )
      );
      if (customerModels.active) {
        customer.activate();
      }
      if (customerModels.rewardPoints > 0) {
        customer.addRewardPoints(customerModels.rewardPoints);
      }
      return customer;
    });

    return customers;
  }
}
