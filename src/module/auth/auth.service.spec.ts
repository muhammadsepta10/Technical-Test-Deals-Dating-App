import { AuthService } from './auth.service';
import { CommonService } from '@common/service/common.service';
import { UserRepository } from 'src/db/project-db/entity/user/user.repository';
import { BadRequestException } from '@nestjs/common';
import { LoginDTO } from './auth.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let commonService: CommonService;
  let userRepository: UserRepository;

  beforeEach(() => {
    // Mock dependencies
    commonService = {
      bcrpytCompare: jest.fn(),
      generateAuthToken: jest.fn()
    } as any;

    userRepository = {
      findUserLogin: jest.fn()
    } as any;

    authService = new AuthService(commonService, {} as any);
    authService['userRepository'] = userRepository;
  });

  describe('login', () => {
    it('should throw BadRequestException if user does not exist', async () => {
      const loginDto: LoginDTO = {
        username: 'testuser',
        password: 'testpass',
        media: '500',
        device: {
          imei: 'string',
          devicetype: 'string',
          language: 'string',
          manufacturer: 'string',
          model: 'string',
          os: 'string',
          osVersion: 'string',
          region: 'string',
          sdkVersion: 'string',
          heightdips: 0,
          heightpixels: 0,
          scale: 0,
          widthdips: 0,
          widthpixels: 0,
          player_id: 'string',
          firebase_id: 'string'
        }
      };
      jest.spyOn(userRepository, 'findUserLogin').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new BadRequestException('invalid username or password')
      );
    });

    it('should throw BadRequestException if user status is not 1', async () => {
      const loginDto: LoginDTO = {
        username: 'testuser',
        password: 'testpass',
        media: '500',
        device: {
          imei: 'string',
          devicetype: 'string',
          language: 'string',
          manufacturer: 'string',
          model: 'string',
          os: 'string',
          osVersion: 'string',
          region: 'string',
          sdkVersion: 'string',
          heightdips: 0,
          heightpixels: 0,
          scale: 0,
          widthdips: 0,
          widthpixels: 0,
          player_id: 'string',
          firebase_id: 'string'
        }
      };
      jest
        .spyOn(userRepository, 'findUserLogin')
        .mockResolvedValue({ status: 0, accessId: 1, hashPassword: '', id: 1 });

      await expect(authService.login(loginDto)).rejects.toThrow(new BadRequestException('verified your user'));
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const loginDto: LoginDTO = {
        username: 'testuser',
        password: 'testpass',
        media: '500',
        device: {
          imei: 'string',
          devicetype: 'string',
          language: 'string',
          manufacturer: 'string',
          model: 'string',
          os: 'string',
          osVersion: 'string',
          region: 'string',
          sdkVersion: 'string',
          heightdips: 0,
          heightpixels: 0,
          scale: 0,
          widthdips: 0,
          widthpixels: 0,
          player_id: 'string',
          firebase_id: 'string'
        }
      };
      jest.spyOn(userRepository, 'findUserLogin').mockResolvedValue({
        status: 1,
        hashPassword: 'hashedPassword',
        accessId: 1,
        id: 1
      });
      jest.spyOn(commonService, 'bcrpytCompare').mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(new BadRequestException('Your Password is incorrect'));
    });

    it('should return token if login is successful', async () => {
      const loginDto: LoginDTO = {
        username: 'testuser',
        password: 'testpass',
        media: '500',
        device: {
          imei: 'string',
          devicetype: 'string',
          language: 'string',
          manufacturer: 'string',
          model: 'string',
          os: 'string',
          osVersion: 'string',
          region: 'string',
          sdkVersion: 'string',
          heightdips: 0,
          heightpixels: 0,
          scale: 0,
          widthdips: 0,
          widthpixels: 0,
          player_id: 'string',
          firebase_id: 'string'
        }
      };
      const mockUser = {
        status: 1,
        id: 1,
        hashPassword: 'hashedPassword',
        accessId: 1
      };
      const mockToken = 'token123';

      jest.spyOn(userRepository, 'findUserLogin').mockResolvedValue(mockUser);
      jest.spyOn(commonService, 'bcrpytCompare').mockResolvedValue(true);
      jest.spyOn(authService as any, '_genToken').mockResolvedValue(mockToken);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ token: mockToken, message: 'Succes login' });
    });
  });
});
