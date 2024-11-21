# Base node image 
FROM node:20 as base 
 
# Install openssl for Prisma 
RUN apt-get update && apt-get install -y openssl 
 
# Install all node_modules, including dev dependencies 
FROM base as deps 
 
RUN mkdir /app 
WORKDIR /app 
 
COPY package.json package-lock.json ./ 
RUN npm install --production=false 
 
# Setup production node_modules 
FROM base as production-deps 
 
ENV NODE_ENV production 
 
RUN mkdir /app 
WORKDIR /app 
 
COPY --from=deps /app/node_modules /app/node_modules 
COPY package.json package-lock.json ./ 
RUN npm prune --production 
 
# Build the app 
FROM base as build 
 
RUN mkdir /app 
WORKDIR /app 
 
COPY --from=deps /app/node_modules /app/node_modules 
 
# Copia la carpeta prisma 
COPY prisma ./prisma
RUN npx prisma generate 
 
# Copia la carpeta app 
COPY app ./app
 
# Copia el resto de archivos necesarios
COPY package.json package-lock.json vite.config.ts tsconfig.json ./
 
RUN npm run build 
 
# Finally, build the production image with minimal footprint 
FROM base 
 
ENV NODE_ENV production 
 
RUN mkdir /app 
WORKDIR /app 
 
COPY --from=production-deps /app/node_modules /app/node_modules 
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma 
COPY --from=build /app/build /app/build 
# COPY --from=build /app/public /app/public 
COPY --from=build /app/prisma /app/prisma 
 
# Copia cualquier otro archivo necesario
COPY package.json package-lock.json ./
 
CMD ["npm", "run", "start"]