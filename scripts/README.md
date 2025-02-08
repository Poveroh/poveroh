### Database

1. Go to docker folder

    ```bash
    cd packages/prisma
    ```

2. Build docker file

    ```bash
    docker build -f db.dockerfile -t poveroh-db .
    ```

3. Run images

    ```bash
    docker compose up -d
    ```

4. Generate client

    ```bash
    prisma generate
    ```

5. Migrate and create models

    ```bash
    prisma migrate dev
    ```
