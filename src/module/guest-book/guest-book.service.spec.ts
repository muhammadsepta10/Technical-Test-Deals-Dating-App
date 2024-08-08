import { Test, TestingModule } from '@nestjs/testing';
import { GuestBookService } from './guest-book.service';

describe('GuestBookService', () => {
  let service: GuestBookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuestBookService]
    }).compile();

    service = module.get<GuestBookService>(GuestBookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
