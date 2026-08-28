import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: env.isDev ? ['error', 'warn'] : ['error'],
  });

if (env.isDev) globalForPrisma.__prisma = prisma;

export default prisma;
