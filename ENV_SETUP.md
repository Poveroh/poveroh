# Environment Variables

Environment variables are stored in a single file but are divided by application.

For both development and local deployment, copy the `.env.example` file into `.env`.
All applications retrieve the necessary variables from this file.

There is also a `.env` file inside the `packages/prisma` folder, but it automatically reads from the root `.env`file.
Do not touch it.

## Database

```
POSTGRES_USER=poveroh
POSTGRES_PASSWORD=poveroh
POSTGRES_DB=poveroh

# For local development, the host is 'localhost:5432'
# For local deploy (docker), the host is 'db:5432'
# For production, insert url you need
DATABASE_HOST=db:5432

#Database connection string for Prisma; don't touch this
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DATABASE_HOST}/${POSTGRES_DB}
```

## Api

```
#API port; default is 3001
API_PORT=3001

# JWT secret key
JWT_KEY=
```

## App

```
#API url; default is localhost:3001 - get the port from the API_PORT variable
NEXT_PUBLIC_API_URL=http://localhost:${API_PORT}
```
