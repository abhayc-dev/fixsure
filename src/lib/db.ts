import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
// Re-triggering build to pick up new Prisma types
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
};

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
