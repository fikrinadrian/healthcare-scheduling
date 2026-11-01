import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Doctor {
  @Field()
  id: string;

  @Field()
  name: string;
}
