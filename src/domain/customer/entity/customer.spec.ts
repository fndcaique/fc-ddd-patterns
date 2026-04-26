import CustomerAddressChangedEvent from "../event/customer-address-changed.event";
import CustomerCreatedEvent from "../event/customer-created.event";
import Address from "../value-object/address";
import Customer from "./customer";

describe("Customer unit tests", () => {
  it("should throw error when id is empty", () => {
    expect(() => {
      const customer = new Customer("", "John");
    }).toThrow("Id is required");
  });

  it("should throw error when name is empty", () => {
    expect(() => {
      const customer = new Customer("123", "");
    }).toThrow("Name is required");
  });

  it("should change name", () => {
    // Arrange
    const customer = new Customer("123", "John");

    // Act
    customer.changeName("Jane");

    // Assert
    expect(customer.name).toBe("Jane");
  });

  it("should activate customer", () => {
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.address = address;

    customer.activate();

    expect(customer.isActive()).toBe(true);
  });

  it("should throw error when address is undefined when you activate a customer", () => {
    expect(() => {
      const customer = new Customer("1", "Customer 1");
      customer.activate();
    }).toThrow("Address is mandatory to activate a customer");
  });

  it("should deactivate customer", () => {
    const customer = new Customer("1", "Customer 1");

    customer.deactivate();

    expect(customer.isActive()).toBe(false);
  });

  it("should add reward points", () => {
    const customer = new Customer("1", "Customer 1");
    expect(customer.rewardPoints).toBe(0);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(10);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(20);
  });

  it("should create a customer", () => {
    jest.useFakeTimers();
    const eventDate = new Date();
    jest.setSystemTime(eventDate);
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    const customer = Customer.create("1", "Customer 1", address);
    expect(customer.id).toBe("1");
    expect(customer.name).toBe("Customer 1");
    expect(customer.address).toEqual(address);
    expect(customer.isActive()).toBe(false);
    expect(customer.rewardPoints).toBe(0);
    expect(customer.events.size).toBe(1);
    const event = customer.events.values().next().value;
    expect(event.constructor.name).toBe(CustomerCreatedEvent.name);
    expect(event.dateTimeOccurred).toEqual(eventDate);
    expect(event.eventData).toEqual({ id: "1", name: "Customer 1" });
    customer.clearEvents();
    expect(customer.events.size).toBe(0);
    jest.useRealTimers();
  });

  it("should change the address", () => {
    jest.useFakeTimers();
    const eventDate = new Date();
    jest.setSystemTime(eventDate);
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    const customer = new Customer("1", "Customer 1", address);

    customer.changeAddress(new Address("Street 2", 456, "19590-000", "Taciba"));

    expect(customer.address.street).toBe("Street 2");
    expect(customer.address.number).toBe(456);
    expect(customer.address.zip).toBe("19590-000");
    expect(customer.address.city).toBe("Taciba");
    expect(customer.events.size).toBe(1);
    const event = customer.events.values().next().value;
    expect(event.constructor.name).toBe(CustomerAddressChangedEvent.name);
    expect(event.dateTimeOccurred).toEqual(eventDate);
    expect(event.eventData).toEqual({
      id: "1",
      name: "Customer 1",
      address: customer.address,
    });
    customer.clearEvents();
    expect(customer.events.size).toBe(0);
    jest.useRealTimers();
  });
});
