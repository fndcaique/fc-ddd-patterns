import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";
import OrderItemModel from "./order-item.model";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = new Customer("123", "Customer 1", address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should throw error when order not found", async () => {
    const orderRepository = new OrderRepository();
    await expect(orderRepository.find("notfoundid")).rejects.toThrow(
      "Order not found"
    );
  });

  it("should find an order by id", async () => {
    const customerRepository = new CustomerRepository();
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = new Customer("123", "Customer 1", address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const foundOrder = await orderRepository.find("123");

    expect(foundOrder).toEqual(order);
  });

  it("should find all orders", async () => {
    const orderRepository = new OrderRepository();
    expect(await orderRepository.findAll()).toEqual([]);

    const customerRepository = new CustomerRepository();
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = new Customer("123", "Customer 1", address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem1 = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const orderItem2 = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      2
    );

    const order1 = new Order("123", "123", [orderItem1]);
    const order2 = new Order("456", "123", [orderItem2]);

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const foundOrders = await orderRepository.findAll();

    expect(foundOrders).toEqual([order1, order2]);
  });

  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const customer = new Customer("123", "Customer 1", address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderFound = await orderRepository.find(order.id);

    expect(orderFound).toEqual(order);

    const newOrderItem = new OrderItem(
      "2",
      product.name,
      product.price * 0.9,
      product.id,
      3
    );

    order.changeItems([newOrderItem]);

    await orderRepository.update(order);

    expect(
      await OrderItemModel.findOne({ where: { id: orderItem.id } })
    ).toBeNull();

    const updatedOrderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });
    expect(updatedOrderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: newOrderItem.id,
          name: newOrderItem.name,
          price: newOrderItem.price,
          quantity: newOrderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });
});
