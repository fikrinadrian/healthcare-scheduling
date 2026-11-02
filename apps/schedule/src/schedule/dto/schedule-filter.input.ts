import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ScheduleFilterInput {
  @Field({ nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  doctorId?: string;

  @Field({ nullable: true })
  objective?: string;

  @Field(() => Date, { nullable: true })
  scheduledAtFrom?: Date;

  @Field(() => Date, { nullable: true })
  scheduledAtTo?: Date;
}
