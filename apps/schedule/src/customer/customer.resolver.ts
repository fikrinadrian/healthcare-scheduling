import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CustomerService } from './customer.service.js';
import { Customer } from './entities/customer.entity.js';
import { CreateCustomerInput } from './dto/create-customer.input.js';
import { UpdateCustomerInput } from './dto/update-customer.input.js';
import { CustomerPage } from './entities/customer-page.entity.js';

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Mutation(() => Customer)
  createCustomer(
    @Args('createCustomerInput') createCustomerInput: CreateCustomerInput,
  ) {
    return this.customerService.create(createCustomerInput);
  }

  @Query(() => CustomerPage, { name: 'customers' })
  findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit = 10,
  ) {
    return this.customerService.findAll(page, limit);
  }

  @Query(() => Customer, { name: 'customer' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.customerService.findOne(id);
  }

  @Mutation(() => Customer)
  updateCustomer(
    @Args('updateCustomerInput') updateCustomerInput: UpdateCustomerInput,
  ) {
    return this.customerService.update(
      updateCustomerInput.id,
      updateCustomerInput,
    );
  }

  @Mutation(() => Customer)
  removeCustomer(@Args('id', { type: () => String }) id: string) {
    return this.customerService.remove(id);
  }
}
