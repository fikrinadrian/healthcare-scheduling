import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Customer {
  @Field()
  id: string;

  @Field()
  name: string;
}
