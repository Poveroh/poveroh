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

### Setup Database and CDN

> Docker and Docker Compose must be installed, up, and running on the machine.

1. Run `setup` file

    ```bash
    npm run setup
    ```

    The command will execute the following steps:

    - Create and run database docker image.
    - Navigate to the `packages/prisma` directory.
    - Generate the Prisma client.
    - Apply any pending migrations to the database using Prisma.
    - Create and run CDN ngix docker image.

    <br>

    > **⚠️ Warning:**  
    > If you encounter any difficulties or something doesn't go as planned, read [this file](./scripts/README.md) to execute it manually.

2. Create a user; open a browser to [http://localhost:5555](http://localhost:5555) and fill out Users table with fields:
    - `name`
    - `surname`
    - `email`
    - `password`, the password must first be encrypted using [SHA-256](https://codebeautify.org/sha256-hash-generator), and then the resulting hash should be encrypted using [BCrypt](https://bcrypt-generator.com/) with 12 rounds (store this in password field).

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
# Build all packages and applications
npm run build

# Build only the packages (types, prisma, utils)
npm run build:packages

# Build individual packages
npm run build:types       # Build types package
npm run build:prisma      # Build prisma package
npm run build:utils       # Build utils package

# Build specific applications
npm run build:storybook   # Build only storybook
npm run build:api         # Build only the API
npm run build:app         # Build only the app
```

## Development Commands

```bash
# Start development servers for API and app
npm run dev

# Start development servers for all projects
npm run dev:all

# Start specific development servers
npm run dev:storybook     # Start Storybook development server
npm run dev:api           # Start API development server
npm run dev:app           # Start app development server
```

## UI Commands

```bash
# Add new UI components
npm run ui:add
```

## Database Commands

```bash
# Set up the database
npm run setup:db

# Prisma commands
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run Prisma migrations
npm run prisma:studio     # Open Prisma Studio
```

## Cleaning Commands

```bash
# Clean everything (node_modules, build files)
npm run clean

# Clean only build files (dist, .next, storybook-static, .turbo)
npm run clean:build

# Clean only Turbo cache
npm run clean:turbo

# Remove all .env files
npm run clean:env

# Clean database data
npm run clean:data
```

## Formatting Commands

```bash
# Format all code with Prettier
npm run format
```

## Docker Commands

```bash
# Create Docker network
npm run docker:create-network

# Start specific services
npm run docker:db        # Start database service
npm run docker:api       # Start API service
npm run docker:app       # Start application service
npm run docker:studio    # Start Prisma Studio service
npm run docker:cdn       # Start CDN service

# Start all services
npm run docker           # Build and start all Docker services
```

## Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```
