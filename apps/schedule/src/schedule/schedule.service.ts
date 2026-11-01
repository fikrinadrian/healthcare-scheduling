import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleInput } from './dto/create-schedule.input.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../../../generated/prisma/client.js';

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

    const conflictingSchedule = await this.prisma.schedule.findFirst({
      where: {
        doctorId: createScheduleInput.doctorId,
        scheduledAt: createScheduleInput.scheduledAt,
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
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Dokter sudah memiliki jadwal pada waktu tersebut',
        );
      }

      throw error;
    }
  }

  findAll() {
    return this.prisma.schedule.findMany({
      include: { customer: true, doctor: true },
    });
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
