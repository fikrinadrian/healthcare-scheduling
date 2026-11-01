import { Test, TestingModule } from '@nestjs/testing';
import { DoctorResolver } from './doctor.resolver';
import { DoctorService } from './doctor.service';

describe('DoctorResolver', () => {
  let resolver: DoctorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorResolver, DoctorService],
    }).compile();

    resolver = module.get<DoctorResolver>(DoctorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
