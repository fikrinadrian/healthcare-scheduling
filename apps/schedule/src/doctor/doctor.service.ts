import { Injectable } from '@nestjs/common';
import { CreateDoctorInput } from './dto/create-doctor.input.js';
import { UpdateDoctorInput } from './dto/update-doctor.input.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPageInfo, normalizePagination } from '../common/pagination.js';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  create(createDoctorInput: CreateDoctorInput) {
    return this.prisma.doctor.create({
      data: {
        name: createDoctorInput.name,
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const pagination = normalizePagination(page, limit);
    const [items, totalCount] = await Promise.all([
      this.prisma.doctor.findMany({
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.doctor.count(),
    ]);

    return {
      items,
      pageInfo: createPageInfo(totalCount, pagination.page, pagination.limit),
    };
  }

  findOne(id: string) {
    return this.prisma.doctor.findUnique({
      where: { id },
    });
  }

  update(id: string, updateDoctorInput: UpdateDoctorInput) {
    return this.prisma.doctor.update({
      where: { id },
      data: {
        name: updateDoctorInput.name,
      },
    });
  }

  remove(id: string) {
    return this.prisma.doctor.delete({
      where: { id },
    });
  }
}
