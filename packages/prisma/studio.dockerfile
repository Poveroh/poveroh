FROM node:23-alpine AS base

ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app

RUN npm install -g prisma

COPY ./packages/prisma/schema.prisma ./schema.prisma

EXPOSE 5555

CMD ["prisma", "studio"]
