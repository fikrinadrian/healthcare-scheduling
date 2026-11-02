import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/entities/page-info.entity.js';
import { Customer } from './customer.entity.js';

@ObjectType()
export class CustomerPage {
  @Field(() => [Customer])
  items: Customer[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
