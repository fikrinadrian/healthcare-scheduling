import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateCustomerInput } from './dto/create-customer.input.js';
import type { UpdateCustomerInput } from './dto/update-customer.input.js';
import { CustomerResolver } from './customer.resolver.js';
import { CustomerService } from './customer.service.js';

describe('CustomerResolver', () => {
  let resolver: CustomerResolver;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    resolver = new CustomerResolver(service as unknown as CustomerService);
  });

  it('delegates customer mutations and queries to CustomerService', () => {
    const createInput = {
      name: 'Customer',
      email: 'customer@example.com',
    } as CreateCustomerInput;
    const updateInput = {
      id: 'customer-1',
      name: 'Updated',
    } as UpdateCustomerInput;
    const customer = { id: 'customer-1', name: 'Customer' };
    const customers = { items: [customer] };
    service.create.mockReturnValue(customer);
    service.findAll.mockReturnValue(customers);
    service.findOne.mockReturnValue(customer);
    service.update.mockReturnValue(customer);
    service.remove.mockReturnValue(customer);

    expect(resolver.createCustomer(createInput)).toBe(customer);
    expect(resolver.findAll(2, 5)).toBe(customers);
    expect(resolver.findOne(customer.id)).toBe(customer);
    expect(resolver.updateCustomer(updateInput)).toBe(customer);
    expect(resolver.removeCustomer(customer.id)).toBe(customer);
    expect(service.create).toHaveBeenCalledWith(createInput);
    expect(service.findAll).toHaveBeenCalledWith(2, 5);
    expect(service.findOne).toHaveBeenCalledWith(customer.id);
    expect(service.update).toHaveBeenCalledWith(updateInput.id, updateInput);
    expect(service.remove).toHaveBeenCalledWith(customer.id);
  });
});
