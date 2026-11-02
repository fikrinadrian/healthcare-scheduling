import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service.js';
import { Schedule } from './entities/schedule.entity.js';
import { CreateScheduleInput } from './dto/create-schedule.input.js';
import { ScheduleFilterInput } from './dto/schedule-filter.input.js';
import { SchedulePage } from './entities/schedule-page.entity.js';

@Resolver(() => Schedule)
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Mutation(() => Schedule)
  createSchedule(
    @Args('createScheduleInput') createScheduleInput: CreateScheduleInput,
  ) {
    return this.scheduleService.create(createScheduleInput);
  }

  @Query(() => SchedulePage, { name: 'schedules' })
  findAll(
    @Args('filter', { type: () => ScheduleFilterInput, nullable: true })
    filter?: ScheduleFilterInput,
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit = 10,
  ) {
    return this.scheduleService.findAll(filter, page, limit);
  }

  @Query(() => Schedule, { name: 'schedule' })
  findOne(@Args('id') id: string) {
    return this.scheduleService.findOne(id);
  }

  @Mutation(() => Schedule)
  removeSchedule(@Args('id') id: string) {
    return this.scheduleService.remove(id);
  }
}
