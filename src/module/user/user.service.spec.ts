import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let masterAccessRepository: MasterAccessRepository;

  beforeEach(async () => {
    const mockUserRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        innerJoinAndMapOne: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn()
      })
    };

    const mockMasterAccessRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          code: 'ADMIN',
          id: 1,
          name: 'Administrator'
        })
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository
        },
        {
          provide: getRepositoryToken(MasterAccessRepository),
          useValue: mockMasterAccessRepository
        }
      ]
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(getRepositoryToken(UserRepository));
    masterAccessRepository = module.get<MasterAccessRepository>(getRepositoryToken(MasterAccessRepository));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMe', () => {
    it('should return user data with status text', async () => {
      const userId = 1;
      const mockUser = {
        username: 'john_doe',
        name: 'John Doe',
        photo: 'profile.jpg',
        access: 'Admin',
        id: '12345',
        isPremium: true,
        status: 1,
        statusText: 'ACTIVE'
      };

      // Mocking the getRawOne method for userRepository
      (userRepository.createQueryBuilder().getRawOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getMe(userId);
      expect(result).toEqual({
        username: 'john_doe',
        name: 'John Doe',
        photo: 'profile.jpg',
        access: 'Admin',
        id: '12345',
        isPremium: true,
        status: 1,
        statusText: 'ACTIVE'
      });
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(userRepository.createQueryBuilder().getRawOne).toHaveBeenCalled();
    });
  });

  describe('getRole', () => {
    it('should return the correct role for a user', async () => {
      const userId = 1;
      const appId = 1;

      const result = await service.getRole(userId, appId);

      expect(result).toEqual({
        code: 'ADMIN',
        id: 1,
        name: 'Administrator'
      });
      expect(masterAccessRepository.createQueryBuilder).toHaveBeenCalled();
      expect(masterAccessRepository.createQueryBuilder().getRawOne).toHaveBeenCalled();
    });
  });

  describe('getListUser', () => {
    it('should return a list of users with roles', async () => {
      const mockUsers = [
        {
          id: '12345',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
          status: 'ACTIVE'
        },
        {
          id: '67890',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'User',
          status: 'INACTIVE'
        }
      ];

      // Mocking the getRawMany method for userRepository
      (userRepository.createQueryBuilder().getRawMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.getListUser();
      expect(result).toEqual(mockUsers);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(userRepository.createQueryBuilder().getRawMany).toHaveBeenCalled();
    });
  });
});
