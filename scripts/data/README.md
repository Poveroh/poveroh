# Database import

This script imports data from JSON or CSV files into database.
It provides flexible options for specifying the data source and handles data validation to prevent duplicate records.

## Features

- **JSON and CSV support:** Imports data from both JSON and CSV files.
- **Table existence validation:** Checks if the target table exists before attempting to import data.
- **Duplicate record prevention:** Skips records with existing IDs to prevent duplicates.
- **Date field conversion:** Automatically converts date fields (created_at, updated_at, deleted_at) to ISO format.
- **Flexible data source:** Imports from a specified folder or a single file.
- **Command-Line arguments:** Uses command-line arguments to specify the folder and file.

## Prerequisites

- Node.js and npm installed.
- Prisma CLI installed and configured for your database.
- `@prisma/client` and `csv-parser` packages installed.
- `.env` file with the database connection URL (`DATABASE_URL`).

## Installation

1.  Install the required dependencies:

    ```bash
    npm install
    ```

2.  Ensure your `.env` file is configured with the correct database connection URL (`DATABASE_URL`).
3.  Run `npm run setup:db` to generate the Prisma client.
4.  Fill "import" folder with your data. They must respect table structure and format. Otherwise you can fill up with "sample" standard data.

## Usage

1.  Run the script using Node.js:

    ```bash
    node filler.js --folder <folderName> --file <fileName>
    ```

    or with npm:

    ```bash
    npm run setup:data -- --folder <folderName> --file <fileName>
    ```

    (Note: Double "--" is required with npm run commands)

### Options

Use this options to customize the script. You can omit them and script will load data from "sample" folder.

- `--folder <folderName>`: Specifies the folder containing the data files. Defaults to `sample`.
- `--file <fileName>`: Specifies a specific file to import. If not provided, all valid files in the folder are imported.

### File Naming

- The filename (without extension) must match the database table name (e.g., `users.json` for the `users` table).
- Supported extensions: `.json`, `.csv`.

### Data Format

- **JSON:** An array of objects
- **CSV:** Comma-separated values, with the first row containing headers
- Date fields (created_at, updated_at, deleted_at) are automatically converted to ISO format.

## Example

```bash
node filler.js --folder sample --file users.json
```

# Database clear tables

This script provides a safe and interactive way to clear data from tables in the database.
It allows you to either clear all tables or select specific tables to clear.
It also temporarily disables referential integrity constraints during the process to ensure a clean truncation.

**WARNING:** This operation is irreversible! Always make a backup of your database before running this script.

## Features

- **Interactive table selection:** Choose to clear all tables or select specific tables from a list.
- **Safety confirmations:** Multiple confirmation prompts to prevent accidental data loss.
- **Referential integrity handling:** Temporarily disables referential integrity constraints during truncation using `SET session_replication_role = replica;` and re-enables them after with `SET session_replication_role = DEFAULT;`.

## Prerequisites

- Node.js and npm installed.
- Prisma CLI installed and configured for your PostgreSQL database.
- `@prisma/client` package installed.

## Installation

1.  Install the required dependencies:

    ```bash
    npm install
    ```

2.  Ensure your `.env` file is configured with the correct database connection URL (`DATABASE_URL`).
3.  Run `npm run setup:db` to generate the Prisma client.

## Usage

1.  Run the script:

    ```bash
    node clean-db.js
    ```

    or with npm:

    ```bash
    npm run clean:data
    ```

2.  The script will display a list of tables found in your database.
3.  You will be prompted to choose between clearing all tables or selecting specific tables.
4.  Follow the on-screen instructions to select the tables and confirm the operation.
5.  The script will then proceed to clear the selected tables and display a summary of the operation.
