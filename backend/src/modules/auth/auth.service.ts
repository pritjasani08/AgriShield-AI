import { IAuthRepository } from './auth.repository';
import { JwtService } from '../../core/services/JwtService';
import { PasswordService } from '../../core/services/PasswordService';
import { SignupDto, LoginDto, AuthResponseDto } from './auth.types';
import { BaseService } from '../../core/services/BaseService';
import { ApiError } from '../../core/utils/ApiError';
import { HTTP_STATUS } from '../../core/constants/http';
import { User } from '../../core/interfaces';
import { AuthMapper } from './auth.mapper';
import { DomainEvents, EventTypes } from '../../core/events';

export class AuthService extends BaseService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService
  ) {
    super();
  }

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const existingUser = await this.authRepository.findUserByPhone(dto.mobile);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Mobile number is already registered');
    }
    if (dto.email) {
      const existingEmail = await this.authRepository.findUserByEmail(dto.email);
      if (existingEmail) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'Email is already registered');
      }
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    
    const rawUser = await this.authRepository.createUser({ ...dto, passwordHash });
    
    const user = AuthMapper.toAuthResponse(rawUser);
    const token = this.jwtService.sign({ id: user.id, email: user.email || user.phone || '' });
    
    DomainEvents.emitEvent(EventTypes.USER_REGISTERED, { userId: user.id, email: user.email });
    
    return { user, token };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const rawUser = dto.mobile
      ? await this.authRepository.findUserByPhone(dto.mobile)
      : await this.authRepository.findUserByEmail(dto.email!);

    if (!rawUser) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const isMatch = await this.passwordService.verify(dto.password, rawUser.passwordHash);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const user = AuthMapper.toAuthResponse(rawUser);
    const token = this.jwtService.sign({ id: user.id, email: user.email || user.phone || '' });
    
    DomainEvents.emitEvent(EventTypes.USER_LOGGED_IN, { userId: user.id });

    return { user, token };
  }

  async getMe(userId: string): Promise<User> {
    const rawUser = await this.authRepository.findUserById(userId);
    if (!rawUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return AuthMapper.toAuthResponse(rawUser);
  }
}
