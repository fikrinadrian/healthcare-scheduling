import { Injectable } from '@nestjs/common';
import { CreateDoctorInput } from './dto/create-doctor.input.js';
import { UpdateDoctorInput } from './dto/update-doctor.input.js';
import { PrismaService } from '../prisma/prisma.service.js';

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

  findAll() {
    return this.prisma.doctor.findMany();
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
