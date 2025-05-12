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
