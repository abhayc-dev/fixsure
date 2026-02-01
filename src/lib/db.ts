import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined,
};

// Force prisma+postgres protocol into environment before client instantiation
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres://")) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace("postgres://", "prisma+postgres://");
}

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
