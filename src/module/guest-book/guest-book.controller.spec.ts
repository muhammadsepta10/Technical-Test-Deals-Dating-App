import { Test, TestingModule } from '@nestjs/testing';
import { GuestBookController } from './guest-book.controller';

describe('GuestBookController', () => {
  let controller: GuestBookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestBookController]
    }).compile();

    controller = module.get<GuestBookController>(GuestBookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
