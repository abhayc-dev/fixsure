import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
};

const url = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString: url });
const adapter = new PrismaPg(pool);

export const db = globalForPrisma.prisma || new PrismaClient({
    // @ts-ignore
    adapter
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
