# Usa una imagen Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos al contenedor
COPY package*.json ./
COPY . .

# Instala las dependencias y construye la aplicación
RUN npm install
RUN npm run build

# Expone el puerto
EXPOSE 8080

# Comando para iniciar la app
CMD ["npm", "run", "start"]
