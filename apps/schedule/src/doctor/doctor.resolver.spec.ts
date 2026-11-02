import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateDoctorInput } from './dto/create-doctor.input.js';
import type { UpdateDoctorInput } from './dto/update-doctor.input.js';
import { DoctorResolver } from './doctor.resolver.js';
import { DoctorService } from './doctor.service.js';

describe('DoctorResolver', () => {
  let resolver: DoctorResolver;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    resolver = new DoctorResolver(service as unknown as DoctorService);
  });

  it('delegates doctor mutations and queries to DoctorService', () => {
    const createInput = { name: 'Dr. Test' } as CreateDoctorInput;
    const updateInput = {
      id: 'doctor-1',
      name: 'Dr. Updated',
    } as UpdateDoctorInput;
    const doctor = { id: 'doctor-1', name: 'Dr. Test' };
    const doctors = { items: [doctor] };
    service.create.mockReturnValue(doctor);
    service.findAll.mockReturnValue(doctors);
    service.findOne.mockReturnValue(doctor);
    service.update.mockReturnValue(doctor);
    service.remove.mockReturnValue(doctor);

    expect(resolver.createDoctor(createInput)).toBe(doctor);
    expect(resolver.findAll(2, 5)).toBe(doctors);
    expect(resolver.findOne(doctor.id)).toBe(doctor);
    expect(resolver.updateDoctor(updateInput)).toBe(doctor);
    expect(resolver.removeDoctor(doctor.id)).toBe(doctor);
    expect(service.create).toHaveBeenCalledWith(createInput);
    expect(service.findAll).toHaveBeenCalledWith(2, 5);
    expect(service.findOne).toHaveBeenCalledWith(doctor.id);
    expect(service.update).toHaveBeenCalledWith(updateInput.id, updateInput);
    expect(service.remove).toHaveBeenCalledWith(doctor.id);
  });
});
