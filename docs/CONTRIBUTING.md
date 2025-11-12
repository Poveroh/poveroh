# Contributing to Poveroh

This repository follows the [GitHub](https://docs.github.com/en/get-started/using-github/github-flow) approach.

The development branch is `main`.

## Get start develop

1. [Fork](https://github.com/Poveroh/poveroh/fork/) this repository and then [clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) it to your local device.
2. Create a new branch:
    ```bash
    git checkout -b <feature_or_fix_or_else>/BRANCH_NAME
    ```
3. Clone the project

    ```bash
    git clone https://github.com/<user>/poveroh.git
    ```

4. Go to the project folder

    ```bash
    cd poveroh
    ```

5. Install dependencies

    ```bash
    npm install
    ```

6. Copy `.env.example` file to `.env`, then edit it with the necessary values. For more details, read [docs](ENV_SETUP.md).

    > If you don't modify them, the default values are sufficient to run the project.
    >
    > **Warning**: Since these are default values, security is not guaranteed.

### Setup Database and CDN

> Docker and Docker Compose must be installed, up, and running on the machine.

1. Run `setup` file

    ```bash
    npm run setup
    ```

    Note: the setup flow may create a small local `proxy` service and to make local subdomains work you may need to add host entries (the repository includes `scripts/setup/proxy.js` which can add them for you).

    The command will execute the following steps:
    - Create and run database docker image.
    - Navigate to the `packages/prisma` directory.
    - Generate the Prisma client.
    - Apply any pending migrations to the database using Prisma.
    - Create and run CDN ngix docker image.

    <br>

    > **⚠️ Warning:**  
    > If you encounter any difficulties or something doesn't go as planned, read [this file](scripts/README.md) to execute it manually.

2. Create a user; open a browser to [localhost:3000/sign-up](http://localhost:3000/sign-up) and sign up.

3. _Optionally_, you can run the following exactly script to generate and fill database with fake data:

    ```bash
    npm run setup:data --user=<user_id_created_before>
    ```

    > You can find user ID on the [personal information page](http://localhost:3000/account/profile)

## Build and run

1. Build project

    ```bash
    npm run build
    ```

2. Run project

    ```bash
    npm run dev
    ```

# Project Commands

## Build Commands

```bash
# Build all packages and apps
npm run build

# Build all internal packages (types, prisma, utils)
npm run build:packages

# Build individual packages
npm run build:types       # Build types package
npm run build:prisma      # Build Prisma package
npm run build:utils       # Build utils package

# Build individual apps
npm run build:storybook   # Build Storybook
npm run build:api         # Build API
npm run build:app         # Build frontend app
```

## Development Commands

```bash
# Start dev servers for API and app
npm run dev

# Start dev servers for all projects (API, app, storybook, etc.)
npm run dev:all

# Start individual dev servers
npm run dev:storybook     # Start Storybook in dev mode
npm run dev:api           # Start API dev server
npm run dev:app           # Start app dev server
```

## UI Commands

```bash
# Add new UI components (from the app)
npm run ui:add
```

## Setup Commands

```bash
# Run all setup tasks (DB and CDN)
npm run setup

# Set up database
npm run setup:db

# Set up CDN
npm run setup:cdn

# Set up environment files
npm run setup:env

# Seed the database with sample data
npm run setup:data

# Generate sample transactions in the database
npm run setup:generate-transactions
```

## Clean Commands

```bash
# Remove node_modules and all build artifacts
npm run clean

# Clean build artifacts (.next, dist, .turbo, storybook-static)
npm run clean:build

# Clean only Turbo cache
npm run clean:turbo

# Remove all .env files
npm run clean:env

# Clean seeded database data
npm run clean:data
```

## Formatting & Linting

```bash
# Format all code (TS/MD/TSX) using Prettier
npm run format

# Run TurboRepo linting
npm run lint
```

## Docker Commands

```bash
# Create Docker network if not exists
npm run docker:create-network

npm run docker-dev:db       # Avvia solo il container DB
npm run docker-dev:api      # Avvia solo il container API
npm run docker-dev:app      # Avvia solo il container frontend app
npm run docker-dev:studio   # Avvia Prisma Studio
npm run docker-dev:cdn      # Avvia il container CDN

# Start all dev Docker services
npm run docker-dev

# Start all production Docker services
npm run docker
```

## Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Run DB migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Management

```bash
# Install husky hooks
npm run prepare

# Publish Storybook via Chromatic
npm run chromatic
```
