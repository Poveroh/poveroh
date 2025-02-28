# Use an official Node.js image
FROM node:18-alpine

ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL

# Set working directory
WORKDIR /app

# Install Prisma CLI globally
RUN npm install -g prisma

COPY ./packages/prisma/schema.prisma ./schema.prisma

# Expose Prisma Studio's default port
EXPOSE 5555

# Set default command to run Prisma Studio
CMD ["prisma", "studio"]
