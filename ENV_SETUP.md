# Environment Variables

Environment variables are stored in a single file but are divided by application.

For both development and local deployment, copy the `.env.example` file into `.env`.
All applications retrieve the necessary variables from this file.

There are also `.env` files inside `packages/prisma`, `apps/app` and `apps/api` folder that directly link to `.env` file in project root. Do not touch them.

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

#Storage

# File storage mode; must be one of the following: local | aws | gcloud | azure | digitalocean
FILE_STORAGE_MODE=local

# For local storage, type full path of folder on your computer (es. /Users/<user>/data-folder)
CDN_DATA_PATH=/Users/<user>/cdn-data

AWS_BUCKET=
AWS_REGION=
AWS_CREDENTIALS_ACCESSKEYID=
AWS_CREDENTIALS_SECRETACCESSKEY=

GCS_BUCKET=
GCS_PROJECTID=

DIGITALOCEAN_BUCKET=
DIGITALOCEAN_REGION=
DIGITALOCEAN_ENDPOINT=
DIGITALOCEAN_CREDENTIALS_ACCESSKEYID=
DIGITALOCEAN_CREDENTIALS_SECRETACCESSKEY=

AZURE_CONNECTION_STRING=
AZURE_CONTAINER=
```

## App

```
#API url; default is localhost:3001 - get the port from the API_PORT variable
NEXT_PUBLIC_API_URL=http://localhost:${API_PORT}
```
