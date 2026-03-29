FROM node:22-alpine AS base

# Don't set DATABASE_URL as ENV here, it will be passed at runtime
WORKDIR /app

RUN npm init -y && npm install prisma@^7.6.0 typescript ts-node @types/node

COPY ./packages/prisma/schema.prisma ./schema.prisma
COPY ./infra/db/prisma.config.ts ./prisma.config.ts

EXPOSE 5555

COPY ./scripts/docker-studio-start.sh /app/
# Fix for Windows line endings if needed
RUN sed -i 's/\r$//' /app/docker-studio-start.sh
RUN chmod +x /app/docker-studio-start.sh

ENTRYPOINT ["/app/docker-studio-start.sh"]

CMD ["npx", "prisma", "studio", "--port", "5555", "--browser", "none"]
