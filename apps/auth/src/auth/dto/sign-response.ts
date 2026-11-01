import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity.js';

@ObjectType()
export class SignResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
