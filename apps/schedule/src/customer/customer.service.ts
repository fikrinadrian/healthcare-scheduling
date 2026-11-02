import { Injectable } from '@nestjs/common';
import { CreateCustomerInput } from './dto/create-customer.input.js';
import { UpdateCustomerInput } from './dto/update-customer.input.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPageInfo, normalizePagination } from '../common/pagination.js';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  create(createCustomerInput: CreateCustomerInput) {
    return this.prisma.customer.create({
      data: {
        name: createCustomerInput.name,
        email: createCustomerInput.email,
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const pagination = normalizePagination(page, limit);
    const [items, totalCount] = await Promise.all([
      this.prisma.customer.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.customer.count(),
    ]);

    return {
      items,
      pageInfo: createPageInfo(totalCount, pagination.page, pagination.limit),
    };
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  update(id: string, updateCustomerInput: UpdateCustomerInput) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        name: updateCustomerInput.name,
        email: updateCustomerInput.email,
      },
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
