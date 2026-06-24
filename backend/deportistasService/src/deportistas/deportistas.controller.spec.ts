import { Test, TestingModule } from '@nestjs/testing';
import { DeportistasController } from './deportistas.controller';

describe('DeportistasController', () => {
  let controller: DeportistasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeportistasController],
    }).compile();

    controller = module.get<DeportistasController>(DeportistasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
