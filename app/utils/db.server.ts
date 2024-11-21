import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

// Mejora el manejo de la inicialización
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient({
    // Configura logging para producción
    log: ['error', 'warn'],
  });
} else {
  if (!global.__db) {
    global.__db = new PrismaClient({
      // Configura logging para desarrollo
      log: ['query', 'error', 'warn', 'info'],
    });
  }
  db = global.__db;
}

// Añade métodos de conexión y desconexión
db.$connect()
  .then(() => console.log('Prisma connected successfully'))
  .catch((error: any) => {
    console.error('Failed to connect to database:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    // En producción, podrías querer manejar este error de manera más robusta
    process.exit(1);
  });

// Manejo de desconexión para prevenir conexiones huérfanas
process.on('beforeExit', async () => {
  try {
    await db.$disconnect();
  } catch (error: unknown) {
    console.error('Error during database disconnection:', error);
  }
});

export { db };