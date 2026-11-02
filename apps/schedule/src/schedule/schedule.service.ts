import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleInput } from './dto/create-schedule.input.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../../../generated/prisma/client.js';
import { ScheduleFilterInput } from './dto/schedule-filter.input.js';
import { createPageInfo, normalizePagination } from '../common/pagination.js';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleInput: CreateScheduleInput) {
    const [customer, doctor] = await Promise.all([
      this.prisma.customer.findUnique({
        where: { id: createScheduleInput.customerId },
        select: { id: true },
      }),
      this.prisma.doctor.findUnique({
        where: { id: createScheduleInput.doctorId },
        select: { id: true },
      }),
    ]);

    if (!customer) {
      throw new NotFoundException(`Customer tidak ditemukan`);
    }

    if (!doctor) {
      throw new NotFoundException(`Doctor tidak ditemukan`);
    }

    const oneHour = 60 * 60 * 1000;
    const earliestAllowed = new Date(
      createScheduleInput.scheduledAt.getTime() - oneHour,
    );
    const latestAllowed = new Date(
      createScheduleInput.scheduledAt.getTime() + oneHour,
    );

    const conflictingSchedule = await this.prisma.schedule.findFirst({
      where: {
        doctorId: createScheduleInput.doctorId,
        scheduledAt: {
          gt: earliestAllowed,
          lt: latestAllowed,
        },
      },
      select: { id: true },
    });

    if (conflictingSchedule) {
      throw new ConflictException(
        'Dokter sudah memiliki jadwal pada waktu tersebut',
      );
    }

    try {
      return await this.prisma.schedule.create({
        data: {
          objective: createScheduleInput.objective,
          scheduledAt: createScheduleInput.scheduledAt,
          customer: { connect: { id: createScheduleInput.customerId } },
          doctor: { connect: { id: createScheduleInput.doctorId } },
        },
        include: { customer: true, doctor: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || error.code === 'P2004')
      ) {
        throw new ConflictException(
          'Dokter sudah memiliki jadwal pada waktu tersebut',
        );
      }

      throw error;
    }
  }

  async findAll(filter?: ScheduleFilterInput, page = 1, limit = 10) {
    if (
      filter?.scheduledAtFrom &&
      filter.scheduledAtTo &&
      filter.scheduledAtFrom > filter.scheduledAtTo
    ) {
      throw new BadRequestException(
        'scheduledAtFrom must be earlier than or equal to scheduledAtTo',
      );
    }

    const pagination = normalizePagination(page, limit);
    const where: Prisma.ScheduleWhereInput = {};

    if (filter?.customerId) where.customerId = filter.customerId;
    if (filter?.doctorId) where.doctorId = filter.doctorId;

    const objective = filter?.objective?.trim();
    if (objective) {
      where.objective = { contains: objective, mode: 'insensitive' };
    }

    if (filter?.scheduledAtFrom || filter?.scheduledAtTo) {
      where.scheduledAt = {
        ...(filter.scheduledAtFrom && { gte: filter.scheduledAtFrom }),
        ...(filter.scheduledAtTo && { lte: filter.scheduledAtTo }),
      };
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
        include: { customer: true, doctor: true },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return {
      items,
      pageInfo: createPageInfo(totalCount, pagination.page, pagination.limit),
    };
  }

  findOne(id: string) {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: { customer: true, doctor: true },
    });
  }

  remove(id: string) {
    return this.prisma.schedule.delete({
      where: { id },
      include: { customer: true, doctor: true },
    });
  }
}
