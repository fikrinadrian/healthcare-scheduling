import { Field, ObjectType } from '@nestjs/graphql';
import { Customer } from '../../customer/entities/customer.entity.js';
import { Doctor } from '../../doctor/entities/doctor.entity.js';

@ObjectType()
export class Schedule {
  @Field()
  id: string;

  @Field()
  objective: string;

  @Field()
  customerId: string;

  @Field()
  doctorId: string;

  @Field(() => Date)
  scheduledAt: Date;

  @Field(() => Customer)
  customer: Customer;

  @Field(() => Doctor)
  doctor: Doctor;
}
