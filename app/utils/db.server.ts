import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient({
    log: ["error", "warn"],
  });
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: ["query", "error", "warn", "info"],
    });
  }
  db = global.__db;
}

db.$connect()
  .then(() => console.log("Prisma connected successfully"))
  .catch((error: any) => {
    console.error("Failed to connect to database:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    process.exit(1);
  });

process.on("beforeExit", async () => {
  try {
    await db.$disconnect();
  } catch (error: unknown) {
    console.error("Error during database disconnection:", error);
  }
});

export { db };
