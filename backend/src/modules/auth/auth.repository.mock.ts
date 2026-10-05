import { IAuthRepository } from './auth.repository';
import { SignupDto } from './auth.types';
import { User } from '../../core/interfaces';
import crypto from 'crypto';

export class MockAuthRepository implements IAuthRepository {
  private users: (User & { passwordHash: string })[] = [
    {
      id: crypto.randomUUID(),
      email: 'demo@agrishield.in',
      firstName: 'Demo',
      lastName: 'Farmer',
      phone: '9825041122',
      passwordHash: '$2b$10$04IwDMkRrOe24rF8wU8.yez9FpyT4HzDn4vjpGs6rO.DqfAJSBO9S', // demo1234
      role: 'admin',
      createdAt: new Date(),
    }
  ];

  async findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  async findUserByPhone(phone: string): Promise<(User & { passwordHash: string }) | null> {
    const user = this.users.find((u) => u.phone === phone);
    return user || null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async createUser(dto: SignupDto & { passwordHash: string }): Promise<User> {
    const newUser = {
      id: crypto.randomUUID(),
      phone: dto.mobile,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash: dto.passwordHash,
      role: 'user',
      createdAt: new Date(),
    };
    
    this.users.push(newUser);
    
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }
}
