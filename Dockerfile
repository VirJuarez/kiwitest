# Usa una imagen Node.js
FROM node:20-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos al contenedor
COPY package*.json ./
COPY . .

# Instala las dependencias y construye la aplicación
RUN npm install
RUN npx prisma generate
RUN npm run build

# Expone el puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "run", "start"]