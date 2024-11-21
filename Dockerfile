# Use the official Node.js 20 image as a parent image
FROM node:20-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your app's source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build your Remix app
RUN npm run build

# Use a smaller base image for the final stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma