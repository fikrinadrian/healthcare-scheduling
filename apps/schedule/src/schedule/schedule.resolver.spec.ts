import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateScheduleInput } from './dto/create-schedule.input.js';
import { ScheduleResolver } from './schedule.resolver.js';
import { ScheduleService } from './schedule.service.js';

describe('ScheduleResolver', () => {
  let resolver: ScheduleResolver;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      remove: vi.fn(),
    };
    resolver = new ScheduleResolver(service as unknown as ScheduleService);
  });

  it('delegates schedule mutations and queries to ScheduleService', () => {
    const input = {
      customerId: 'customer-1',
      doctorId: 'doctor-1',
      objective: 'Consultation',
      scheduledAt: new Date('2026-12-01T09:00:00.000Z'),
    } as CreateScheduleInput;
    const schedule = { id: 'schedule-1' };
    const schedules = [schedule];
    service.create.mockReturnValue(schedule);
    service.findAll.mockReturnValue(schedules);
    service.findOne.mockReturnValue(schedule);
    service.remove.mockReturnValue(schedule);

    expect(resolver.createSchedule(input)).toBe(schedule);
    expect(resolver.findAll(undefined, 2, 5)).toBe(schedules);
    expect(resolver.findOne(schedule.id)).toBe(schedule);
    expect(resolver.removeSchedule(schedule.id)).toBe(schedule);
    expect(service.create).toHaveBeenCalledWith(input);
    expect(service.findAll).toHaveBeenCalledWith(undefined, 2, 5);
    expect(service.findOne).toHaveBeenCalledWith(schedule.id);
    expect(service.remove).toHaveBeenCalledWith(schedule.id);
  });
});
