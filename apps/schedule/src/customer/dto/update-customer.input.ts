import { CreateCustomerInput } from './create-customer.input.js';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCustomerInput extends PartialType(CreateCustomerInput) {
  @Field()
  id: string;

  @Field()
  name: string;
}
