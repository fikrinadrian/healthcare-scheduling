import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateDoctorInput {
  @Field()
  name: string;
}
