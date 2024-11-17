import { Test, TestingModule } from '@nestjs/testing';
import { S3CoreService } from './s3.service';

describe('S3CoreService', () => {
  let service: S3CoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3CoreService],
    }).compile();

    service = module.get<S3CoreService>(S3CoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
