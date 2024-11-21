# Usa una imagen Node.js que coincida con tu configuración
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios primero
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia el resto del código
COPY . .

# Genera Prisma Client
RUN npx prisma generate

# Construye la aplicación
RUN npm run build

# Expone el puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "run", "start"]