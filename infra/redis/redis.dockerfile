FROM redis

EXPOSE 6379

CMD ["sh", "-c", "redis-server --requirepass $REDIS_PASSWORD"]
