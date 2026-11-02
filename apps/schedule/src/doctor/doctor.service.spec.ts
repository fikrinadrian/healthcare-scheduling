import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateDoctorInput } from './dto/create-doctor.input.js';
import type { UpdateDoctorInput } from './dto/update-doctor.input.js';
import { DoctorService } from './doctor.service.js';

describe('DoctorService', () => {
  let service: DoctorService;
  let doctor: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    doctor = {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new DoctorService({ doctor } as unknown as PrismaService);
  });

  it('creates a doctor from the provided input', async () => {
    const input: CreateDoctorInput = { name: 'Dr. Test' };
    const record = { id: 'doctor-1', ...input };
    doctor.create.mockResolvedValue(record);

    await expect(service.create(input)).resolves.toBe(record);
    expect(doctor.create).toHaveBeenCalledWith({ data: { name: input.name } });
  });

  it('returns the requested doctor page and pagination metadata', async () => {
    const records = [{ id: 'doctor-1' }];
    doctor.findMany.mockResolvedValue(records);
    doctor.count.mockResolvedValue(21);

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
    expect(doctor.findMany).toHaveBeenCalledWith({
      skip: 10,
      take: 10,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
    expect(doctor.count).toHaveBeenCalledWith();
  });

  it('finds a doctor by ID', async () => {
    const record = { id: 'doctor-1' };
    doctor.findUnique.mockResolvedValue(record);

    await expect(service.findOne('doctor-1')).resolves.toBe(record);
    expect(doctor.findUnique).toHaveBeenCalledWith({
      where: { id: 'doctor-1' },
    });
  });

  it('updates a doctor by ID', async () => {
    const input = { id: 'doctor-1', name: 'Dr. Updated' } as UpdateDoctorInput;
    const record = { ...input };
    doctor.update.mockResolvedValue(record);

    await expect(service.update(input.id, input)).resolves.toBe(record);
    expect(doctor.update).toHaveBeenCalledWith({
      where: { id: input.id },
      data: { name: input.name },
    });
  });

  it('deletes a doctor by ID', async () => {
    const record = { id: 'doctor-1' };
    doctor.delete.mockResolvedValue(record);

    await expect(service.remove('doctor-1')).resolves.toBe(record);
    expect(doctor.delete).toHaveBeenCalledWith({ where: { id: 'doctor-1' } });
  });
});
