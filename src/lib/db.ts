import { PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { vaidoraDb?: PrismaClient };
export const db = globalDb.vaidoraDb ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalDb.vaidoraDb = db;
