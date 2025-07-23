import {
  BadRequestException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatus } from '@prisma/client';
import * as utils from '../../common/utils';
import { UserRepository } from '../user/user.repository';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dtos';

// Mock the utils module
jest.mock('../../common/utils', () => ({
  handleError: jest.fn((error) => {
    throw error;
  }),
  compareHash: jest.fn(),
  createHash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'jwt.accessToken.secretKey': 'test-access-secret',
        'jwt.refreshToken.secretKey': 'test-refresh-secret',
        'jwt.accessToken.expire': '15m',
        'jwt.refreshToken.expire': '7d',
      };
      return config[key];
    }),
  };

  const mockUserRepository = {
    createUser: jest.fn(),
    findUserById: jest.fn(),
    findOneByCondition: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashed_password_123';
      const createdUser = {
        id: 1,
        email: signupDto.email,
        name: signupDto.name,
      };
      const userInfo = { id: 1, email: signupDto.email, name: signupDto.name };
      const accessToken = 'access_token_123';
      const refreshToken = 'refresh_token_123';

      // Mock dependencies
      mockUserRepository.findOneByCondition.mockResolvedValue(null); // User doesn't exist
      (utils.createHash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.createUser.mockResolvedValue(createdUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);
      mockUserRepository.findUserById.mockResolvedValue(userInfo);

      const result = await service.signup(signupDto);

      expect(userRepository.findOneByCondition).toHaveBeenCalledWith({
        email: signupDto.email,
      });
      expect(utils.createHash).toHaveBeenCalledWith(signupDto.password);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        email: signupDto.email,
        password: hashedPassword,
        name: signupDto.name,
        status: UserStatus.active,
      });
      expect(result.data).toEqual({
        accessToken,
        refreshToken,
        userInfo,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const existingUser = { id: 1, email: signupDto.email };
      mockUserRepository.findOneByCondition.mockResolvedValue(existingUser);

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.findOneByCondition).toHaveBeenCalledWith({
        email: signupDto.email,
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed_password',
        status: UserStatus.active,
      };
      const accessToken = 'access_token_123';

      mockUserRepository.findOneByCondition.mockResolvedValue(user);
      (utils.compareHash as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      await service.login(loginDto);

      expect(userRepository.findOneByCondition).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(utils.compareHash).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { userId: user.id },
        {
          secret: 'test-access-secret',
          expiresIn: '15m',
        },
      );
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      mockUserRepository.findOneByCondition.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for wrong password', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed_password',
        status: UserStatus.active,
      };

      mockUserRepository.findOneByCondition.mockResolvedValue(user);
      (utils.compareHash as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnprocessableEntityException for inactive user', async () => {
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed_password',
        status: UserStatus.deactive,
      };

      mockUserRepository.findOneByCondition.mockResolvedValue(user);
      (utils.compareHash as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('validateUserBeforeCreate', () => {
    it('should not throw error if user does not exist', async () => {
      mockUserRepository.findOneByCondition.mockResolvedValue(null);

      await expect(
        service.validateUserBeforeCreate({ email: 'test@example.com' }),
      ).resolves.not.toThrow();
    });

    it('should throw ConflictException if user exists', async () => {
      const existingUser = { id: 1, email: 'test@example.com' };
      mockUserRepository.findOneByCondition.mockResolvedValue(existingUser);

      await expect(
        service.validateUserBeforeCreate({ email: 'test@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
