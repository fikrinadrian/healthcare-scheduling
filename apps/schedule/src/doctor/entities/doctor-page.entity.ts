import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/entities/page-info.entity.js';
import { Doctor } from './doctor.entity.js';

@ObjectType()
export class DoctorPage {
  @Field(() => [Doctor])
  items: Doctor[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
