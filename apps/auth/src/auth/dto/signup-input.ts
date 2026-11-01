import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class SignUpInput {
  @IsNotEmpty()
  @IsEmail()
  @Field(() => String)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Field(() => String)
  password: string;
}
