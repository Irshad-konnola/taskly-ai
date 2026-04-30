import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
// 1. Import from your local folder instead of node_modules!
import { PrismaClient } from "./generated/prisma/client.js";

// 2. Setup the Prisma 7 Driver Adapter
const connectionString = process.env.DATABASE_URL as string;
const adapter = new PrismaPg({ connectionString });

// 3. Prevent multiple instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 4. Inject the adapter into the Prisma Client
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;