import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateScheduleInput {
  @Field()
  objective: string;

  @Field()
  customerId: string;

  @Field()
  doctorId: string;

  @Field(() => Date)
  scheduledAt: Date;
}
