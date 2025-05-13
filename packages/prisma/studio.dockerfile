FROM node:23-alpine AS base

# Don't set DATABASE_URL as ENV here, it will be passed at runtime
WORKDIR /app

RUN npm install -g prisma

COPY ./packages/prisma/schema.prisma ./schema.prisma

EXPOSE 5555

COPY ./scripts/docker-studio-start.sh /app/
# Fix for Windows line endings if needed
RUN sed -i 's/\r$//' /app/docker-studio-start.sh
RUN chmod +x /app/docker-studio-start.sh

ENTRYPOINT ["/app/docker-studio-start.sh"]

CMD ["prisma", "studio"]
