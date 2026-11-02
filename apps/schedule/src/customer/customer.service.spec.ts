import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateCustomerInput } from './dto/create-customer.input.js';
import type { UpdateCustomerInput } from './dto/update-customer.input.js';
import { CustomerService } from './customer.service.js';

describe('CustomerService', () => {
  let service: CustomerService;
  let customer: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    customer = {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new CustomerService({ customer } as unknown as PrismaService);
  });

  it('creates a customer from the provided input', async () => {
    const input: CreateCustomerInput = {
      name: 'Test Customer',
      email: 'customer@example.com',
    };
    const record = { id: 'customer-1', ...input };
    customer.create.mockResolvedValue(record);

    await expect(service.create(input)).resolves.toBe(record);
    expect(customer.create).toHaveBeenCalledWith({ data: input });
  });

  it('returns the requested customer page and pagination metadata', async () => {
    const records = [{ id: 'customer-1' }];
    customer.findMany.mockResolvedValue(records);
    customer.count.mockResolvedValue(21);

    await expect(service.findAll(2, 10)).resolves.toEqual({
      items: records,
      pageInfo: {
        page: 2,
        limit: 10,
        totalCount: 21,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
    expect(customer.findMany).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
    expect(customer.count).toHaveBeenCalledWith();
  });

  it('finds a customer by ID', async () => {
    const record = { id: 'customer-1' };
    customer.findUnique.mockResolvedValue(record);

    await expect(service.findOne('customer-1')).resolves.toBe(record);
    expect(customer.findUnique).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
    });
  });

  it('updates a customer by ID', async () => {
    const input = {
      id: 'customer-1',
      name: 'Updated',
      email: 'updated@example.com',
    } as UpdateCustomerInput;
    const record = { ...input };
    customer.update.mockResolvedValue(record);

    await expect(service.update(input.id, input)).resolves.toBe(record);
    expect(customer.update).toHaveBeenCalledWith({
      where: { id: input.id },
      data: { name: input.name, email: input.email },
    });
  });

  it('deletes a customer by ID', async () => {
    const record = { id: 'customer-1' };
    customer.delete.mockResolvedValue(record);

    await expect(service.remove('customer-1')).resolves.toBe(record);
    expect(customer.delete).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
    });
  });
});
