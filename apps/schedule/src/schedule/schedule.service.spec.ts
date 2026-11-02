import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ScheduleService } from './schedule.service.js';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let prisma: {
    customer: { findUnique: ReturnType<typeof vi.fn> };
    doctor: { findUnique: ReturnType<typeof vi.fn> };
    schedule: Record<string, ReturnType<typeof vi.fn>>;
  };

  beforeEach(() => {
    prisma = {
      customer: { findUnique: vi.fn() },
      doctor: { findUnique: vi.fn() },
      schedule: {
        findFirst: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new ScheduleService(prisma as unknown as PrismaService);
  });

  it('creates a schedule after checking related records and time conflicts', async () => {
    const scheduledAt = new Date('2026-12-01T09:00:00.000Z');
    const input = {
      customerId: 'customer-1',
      doctorId: 'doctor-1',
      objective: 'Consultation',
      scheduledAt,
    };
    const record = { id: 'schedule-1', ...input };
    prisma.customer.findUnique.mockResolvedValue({ id: input.customerId });
    prisma.doctor.findUnique.mockResolvedValue({ id: input.doctorId });
    prisma.schedule.findFirst.mockResolvedValue(null);
    prisma.schedule.create.mockResolvedValue(record);

    await expect(service.create(input)).resolves.toBe(record);
    expect(prisma.schedule.findFirst).toHaveBeenCalledWith({
      where: {
        doctorId: input.doctorId,
        scheduledAt: {
          gt: new Date(scheduledAt.getTime() - 60 * 60 * 1000),
          lt: new Date(scheduledAt.getTime() + 60 * 60 * 1000),
        },
      },
      select: { id: true },
    });
    expect(prisma.schedule.create).toHaveBeenCalledWith({
      data: {
        objective: input.objective,
        scheduledAt,
        customer: { connect: { id: input.customerId } },
        doctor: { connect: { id: input.doctorId } },
      },
      include: { customer: true, doctor: true },
    });
  });

  it('rejects a schedule when the customer does not exist', async () => {
    prisma.customer.findUnique.mockResolvedValue(null);
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });

    await expect(
      service.create({
        customerId: 'missing-customer',
        doctorId: 'doctor-1',
        objective: 'Consultation',
        scheduledAt: new Date('2026-12-01T09:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.schedule.findFirst).not.toHaveBeenCalled();
  });

  it('rejects a schedule when the doctor does not exist', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'customer-1' });
    prisma.doctor.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        customerId: 'customer-1',
        doctorId: 'missing-doctor',
        objective: 'Consultation',
        scheduledAt: new Date('2026-12-01T09:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.schedule.findFirst).not.toHaveBeenCalled();
  });

  it('rejects a schedule that conflicts with an existing appointment', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 'customer-1' });
    prisma.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });
    prisma.schedule.findFirst.mockResolvedValue({ id: 'existing-schedule' });

    await expect(
      service.create({
        customerId: 'customer-1',
        doctorId: 'doctor-1',
        objective: 'Consultation',
        scheduledAt: new Date('2026-12-01T09:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.schedule.create).not.toHaveBeenCalled();
  });

  it('filters and paginates schedules while returning pagination metadata', async () => {
    const scheduledAtFrom = new Date('2026-12-01T00:00:00.000Z');
    const scheduledAtTo = new Date('2026-12-31T23:59:59.000Z');
    const filter = {
      customerId: 'customer-1',
      doctorId: 'doctor-1',
      objective: 'consultation',
      scheduledAtFrom,
      scheduledAtTo,
    };
    const records = [{ id: 'schedule-1' }];
    prisma.schedule.findMany.mockResolvedValue(records);
    prisma.schedule.count.mockResolvedValue(12);

    await expect(service.findAll(filter, 2, 5)).resolves.toEqual({
      items: records,
      pageInfo: {
        page: 2,
        limit: 5,
        totalCount: 12,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });

    const where = {
      customerId: 'customer-1',
      doctorId: 'doctor-1',
      objective: { contains: 'consultation', mode: 'insensitive' },
      scheduledAt: { gte: scheduledAtFrom, lte: scheduledAtTo },
    };
    expect(prisma.schedule.findMany).toHaveBeenCalledWith({
      where,
      skip: 5,
      take: 5,
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      include: { customer: true, doctor: true },
    });
    expect(prisma.schedule.count).toHaveBeenCalledWith({ where });
  });

  it('rejects an invalid scheduled-at range', async () => {
    await expect(
      service.findAll({
        scheduledAtFrom: new Date('2026-12-02T00:00:00.000Z'),
        scheduledAtTo: new Date('2026-12-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.schedule.findMany).not.toHaveBeenCalled();
  });

  it('loads and deletes schedules with their related customer and doctor', async () => {
    const schedules = [{ id: 'schedule-1' }];
    const schedule = schedules[0];
    prisma.schedule.findMany.mockResolvedValue(schedules);
    prisma.schedule.count.mockResolvedValue(1);
    prisma.schedule.findUnique.mockResolvedValue(schedule);
    prisma.schedule.delete.mockResolvedValue(schedule);

    await expect(service.findAll()).resolves.toEqual({
      items: schedules,
      pageInfo: {
        page: 1,
        limit: 10,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    await expect(service.findOne(schedule.id)).resolves.toBe(schedule);
    await expect(service.remove(schedule.id)).resolves.toBe(schedule);
    expect(prisma.schedule.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      include: { customer: true, doctor: true },
    });
    expect(prisma.schedule.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.schedule.findUnique).toHaveBeenCalledWith({
      where: { id: schedule.id },
      include: { customer: true, doctor: true },
    });
    expect(prisma.schedule.delete).toHaveBeenCalledWith({
      where: { id: schedule.id },
      include: { customer: true, doctor: true },
    });
  });
});
