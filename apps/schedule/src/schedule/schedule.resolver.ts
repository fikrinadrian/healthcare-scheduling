import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service.js';
import { Schedule } from './entities/schedule.entity.js';
import { CreateScheduleInput } from './dto/create-schedule.input.js';

@Resolver(() => Schedule)
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Mutation(() => Schedule)
  createSchedule(
    @Args('createScheduleInput') createScheduleInput: CreateScheduleInput,
  ) {
    return this.scheduleService.create(createScheduleInput);
  }

  @Query(() => [Schedule], { name: 'schedules' })
  findAll() {
    return this.scheduleService.findAll();
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
