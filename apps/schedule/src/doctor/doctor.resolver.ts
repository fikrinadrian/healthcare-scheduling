import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DoctorService } from './doctor.service.js';
import { Doctor } from './entities/doctor.entity.js';
import { CreateDoctorInput } from './dto/create-doctor.input.js';
import { UpdateDoctorInput } from './dto/update-doctor.input.js';

@Resolver(() => Doctor)
export class DoctorResolver {
  constructor(private readonly doctorService: DoctorService) {}

  @Mutation(() => Doctor)
  createDoctor(
    @Args('createDoctorInput') createDoctorInput: CreateDoctorInput,
  ) {
    return this.doctorService.create(createDoctorInput);
  }

  @Query(() => [Doctor], { name: 'doctors' })
  findAll() {
    return this.doctorService.findAll();
  }

  @Query(() => Doctor, { name: 'doctor' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.doctorService.findOne(id);
  }

  @Mutation(() => Doctor)
  updateDoctor(
    @Args('updateDoctorInput') updateDoctorInput: UpdateDoctorInput,
  ) {
    return this.doctorService.update(updateDoctorInput.id, updateDoctorInput);
  }

  @Mutation(() => Doctor)
  removeDoctor(@Args('id', { type: () => String }) id: string) {
    return this.doctorService.remove(id);
  }
}
