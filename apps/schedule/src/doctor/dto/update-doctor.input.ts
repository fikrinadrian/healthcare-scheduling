import { CreateDoctorInput } from './create-doctor.input.js';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDoctorInput extends PartialType(CreateDoctorInput) {
  @Field()
  id: string;

  @Field()
  name: string;
}
