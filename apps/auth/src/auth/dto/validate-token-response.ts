import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity.js';

@ObjectType()
export class ValidateTokenResponse {
  @Field(() => Boolean)
  valid: boolean;

  @Field(() => User, { nullable: true })
  user: User | null;
}
