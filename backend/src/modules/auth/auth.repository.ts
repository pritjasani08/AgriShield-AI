import { SignupDto } from './auth.types';
import { User } from '../../core/interfaces';

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  findUserByPhone(phone: string): Promise<(User & { passwordHash: string }) | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(dto: SignupDto & { passwordHash: string }): Promise<User>;
}
