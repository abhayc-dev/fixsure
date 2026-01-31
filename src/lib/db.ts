import { PrismaClient } from "@prisma/client";
import { Pool, types } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Speed up bigint parsing
types.setTypeParser(20, (val) => parseInt(val, 10));

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
  pool: Pool | undefined 
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({ 
    connectionString,
    max: 10, // Limit pool size for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

const adapter = new PrismaPg(globalForPrisma.pool);

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // log: ["error"], // Only log errors in production for speed
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
