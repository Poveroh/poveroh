### Database

1. Build and run docker database

    ```bash
    npm run docker-dev:db
    ```

2. Build and run docker prisma studio

    ```bash
    npm run docker-dev:studio
    ```

3. Go to prisma folder

    ```bash
    cd packages/prisma
    ```

4. Generate client

    ```bash
    prisma generate
    ```

5. Migrate and create models

    ```bash
    prisma migrate dev
    ```

### CDN

1. Build and run docker ngix CDN

    ```bash
    npm run docker-dev:cdn
    ```

### Proxy and local hostnames

The repository includes a small `proxy` service (nginx) that routes local domains to internal containers. For convenient local testing add the following lines to your `/etc/hosts` (or let the helper script do it):

```text
127.0.0.1 app.poveroh.local
127.0.0.1 api.poveroh.local
127.0.0.1 studio.poveroh.local
127.0.0.1 db.poveroh.local
127.0.0.1 redis.poveroh.local
127.0.0.1 cdn.poveroh.local
::1 app.poveroh.local
::1 api.poveroh.local
::1 studio.poveroh.local
::1 db.poveroh.local
::1 redis.poveroh.local
```

Use the helper to write hosts and start proxy:

```bash
node scripts/setup/proxy.js
```
