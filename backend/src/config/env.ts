import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().default('10').transform(Number),
  DATABASE_PROVIDER: z.enum(['postgres', 'mock']).default('postgres'),
  FASTAPI_URL: z.string().url('Invalid FASTAPI_URL').optional(),
});

const _env = envSchema.safeParse(process.env);

import { logger } from '../core/utils/logger';

if (!_env.success) {
  logger.error('Invalid environment variables', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
