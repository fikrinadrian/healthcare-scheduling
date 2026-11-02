import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/entities/page-info.entity.js';
import { Schedule } from './schedule.entity.js';

@ObjectType()
export class SchedulePage {
  @Field(() => [Schedule])
  items: Schedule[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
