#!/bin/bash

# Global variables
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"
ENV_FILE="$PROJECT_ROOT/poveroh.env"
GITHUB_REPO_URL="https://raw.githubusercontent.com/Poveroh/poveroh/main"

# Function to download a file from GitHub
fetch_file_from_github() {
    local file_path="$1"
    local destination="$2"

    echo "Fetching $file_path from GitHub..."
    # Ensure the destination directory exists
    local destination_dir
    destination_dir=$(dirname "$destination")
    if [[ ! -d "$destination_dir" ]]; then
        echo "Creating directory $destination_dir..."
        mkdir -p "$destination_dir"
    fi

    curl -sSL "$GITHUB_REPO_URL/$file_path" -o "$destination"
    if [[ $? -ne 0 ]]; then
        echo "Error: Failed to download $file_path from GitHub."
        exit 1
    fi
    echo "$file_path downloaded successfully to $destination."
}

# Function to detect architecture and set image configuration
detect_architecture_and_configure() {
    echo "Detecting system architecture..."

    local arch
    arch=$(uname -m)

    case "$arch" in
        x86_64)
            echo "Architecture detected: amd64"
            export IMAGE_ARCH="amd64"
            ;;
        arm64|aarch64)
            echo "Architecture detected: arm64"
            export IMAGE_ARCH="arm64"
            ;;
        *)
            echo "Error: Unsupported architecture: $arch"
            exit 1
            ;;
    esac

    echo "Using image configuration for $IMAGE_ARCH."
}

# Function to download necessary files
download_files() {
    echo "Starting file download process..."

    if [[ ! -f "$COMPOSE_FILE" ]]; then
        echo "Downloading docker-compose.prod.yml file..."
        fetch_file_from_github "docker/docker-compose.prod.yml" "$COMPOSE_FILE"
    else
        echo "docker-compose.prod.yml already exists. Skipping download."
    fi

    if [[ ! -f "$ENV_FILE" ]]; then
        echo "Downloading poveroh.sample file..."
        fetch_file_from_github ".env.prod.example" "$ENV_FILE"
    else
        echo "$ENV_FILE already exists. Skipping download."
    fi

    echo "All necessary files are downloaded."
}

# Function to download Docker images
download_images() {
    echo "Starting Docker image download process for $IMAGE_ARCH..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
    if [[ $? -eq 0 ]]; then
        echo "Docker images downloaded successfully."
    else
        echo "Error: Failed to download Docker images."
        exit 1
    fi
}

# Function to configure environment file
configure_env_file() {
    echo "Configuring environment file..."

    # Generate a random JWT_KEY if the value is empty
    if grep -q '^JWT_KEY=' "$ENV_FILE"; then
        local current_jwt_key
        current_jwt_key=$(grep '^JWT_KEY=' "$ENV_FILE" | cut -d '=' -f 2)
        if [[ -z "$current_jwt_key" ]]; then
            echo "JWT_KEY is empty. Generating a new key..."
            local jwt_key
            jwt_key=$(openssl rand -hex 32)
            sed -i '' "s|^JWT_KEY=.*|JWT_KEY=$jwt_key|" "$ENV_FILE"
            echo "Generated and set JWT_KEY in $ENV_FILE."
        else
            echo "JWT_KEY already exists and is set in $ENV_FILE."
        fi
    else
        echo "JWT_KEY not found. Adding a new key..."
        local jwt_key
        jwt_key=$(openssl rand -hex 32)
        echo "JWT_KEY=$jwt_key" >>"$ENV_FILE"
        echo "Generated and set JWT_KEY in $ENV_FILE."
    fi

    # Set CDN_LOCAL_DATA_PATH to the root of the folder
    if ! grep -q '^CDN_LOCAL_DATA_PATH=' "$ENV_FILE"; then
        echo "Adding CDN_LOCAL_DATA_PATH to $ENV_FILE..."
        echo "CDN_LOCAL_DATA_PATH=$PROJECT_ROOT/cdn-data" >>"$ENV_FILE"
        echo "Set CDN_LOCAL_DATA_PATH to $PROJECT_ROOT/cdn-data in $ENV_FILE."
    else
        echo "Updating CDN_LOCAL_DATA_PATH in $ENV_FILE..."
        sed -i '' "s|^CDN_LOCAL_DATA_PATH=.*|CDN_LOCAL_DATA_PATH=$PROJECT_ROOT/cdn-data|" "$ENV_FILE"
        echo "Updated CDN_LOCAL_DATA_PATH to $PROJECT_ROOT/cdn-data in $ENV_FILE."
    fi

    # Create the cdn-data folder if it doesn't exist
    if [[ ! -d "$PROJECT_ROOT/cdn-data" ]]; then
        echo "Creating folder $PROJECT_ROOT/cdn-data..."
        mkdir -p "$PROJECT_ROOT/cdn-data"
        echo "Folder $PROJECT_ROOT/cdn-data created."
    else
        echo "Folder $PROJECT_ROOT/cdn-data already exists."
    fi

    echo "Environment file configured successfully."

    # Add IMAGE_ARCH to the environment file
    if ! grep -q '^IMAGE_ARCH=' "$ENV_FILE"; then
        echo "Adding IMAGE_ARCH to $ENV_FILE..."
        echo "IMAGE_ARCH=$IMAGE_ARCH" >> "$ENV_FILE"
        echo "Added IMAGE_ARCH=$IMAGE_ARCH to $ENV_FILE."
    else
        echo "Updating IMAGE_ARCH in $ENV_FILE..."
        sed -i '' "s|^IMAGE_ARCH=.*|IMAGE_ARCH=$IMAGE_ARCH|" "$ENV_FILE"
        echo "Updated IMAGE_ARCH to $IMAGE_ARCH in $ENV_FILE."
    fi

    echo "Copying environment file to .env..."
    copy_env_file
    echo "Environment file copied successfully."
}

# Function to copy environment file
copy_env_file() {
    cp "$ENV_FILE" "$PROJECT_ROOT/.env"
}

# Function to start or update images
start_images() {
    echo "Starting Docker containers..."
    docker network ls | grep -w poveroh_network || {
        echo "Creating Docker network poveroh_network..."
        docker network create poveroh_network
        echo "Docker network poveroh_network created."
    }

    echo "Starting or updating images..."
    local database_host
    database_host=$(grep -E '^DATABASE_HOST=' "$ENV_FILE" | cut -d '=' -f 2)

    if [[ -z "$database_host" ]]; then
        echo "Error: DATABASE_HOST is not set in $ENV_FILE."
        exit 1
    fi

    local is_local_db="false"
    if [[ "$database_host" == "localhost:5432" || "$database_host" == "db:5432" || "$database_host" == "db.poveroh.local:5432" ]]; then
        is_local_db="true"
    fi

    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    if [[ $? -eq 0 ]]; then
        echo "✅ Docker containers started successfully."
        echo "🚀 App is running at http://app.poveroh.local"
    else
        echo "Error: Failed to start Docker containers."
        exit 1
    fi
}

# Ensure proper function call syntax
stop_images() {
    echo "Preparing to stop Docker images..."
    local stop_choice="$1"

    if [[ -z "$stop_choice" ]]; then
        echo "Do you want to stop all images or only some?"
        echo "1) Stop all images"
        echo "2) Stop specific images"

        read -rp "Enter your choice [1-2]: " stop_choice
    fi

    case "$stop_choice" in
        1)
            echo "Stopping all images..."
            docker compose -f "$COMPOSE_FILE" down
            echo "All images stopped successfully."
            ;;
        2)
            echo "Enter the names of the services to stop (separated by space):"
            read -r services_to_stop
            echo "Stopping services: $services_to_stop..."
            docker compose -f "$COMPOSE_FILE" stop $services_to_stop
            echo "Selected services stopped successfully."
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
}

# Function to inject platform configuration into docker-compose.prod.yml
inject_platform_into_compose() {
    echo "Injecting platform configuration into $COMPOSE_FILE..."

    if [[ "$IMAGE_ARCH" == "amd64" ]]; then
        # Add `platform: linux/amd64` to each service image in the docker-compose file
        awk '/image:/ { print $0 ORS "    platform: linux/amd64"; next }1' "$COMPOSE_FILE" > "$COMPOSE_FILE.tmp" && mv "$COMPOSE_FILE.tmp" "$COMPOSE_FILE"
        echo "Injected platform: linux/amd64 into $COMPOSE_FILE."
    else
        echo "No platform injection needed for architecture: $IMAGE_ARCH."
    fi
}

# Function to ensure hosts entries
ensure_hosts_entries() {
    echo "Ensuring hosts entries in /etc/hosts..."

    local hosts_path="/etc/hosts"

    if grep -q "app.poveroh.local" "$hosts_path"; then
        echo "Hosts entries already exist. Skipping update."
        return
    fi

    echo "Adding entries to /etc/hosts (sudo may prompt for your password)..."
    {
        echo ""
        echo "127.0.0.1 app.poveroh.local"
        echo "127.0.0.1 api.poveroh.local"
        echo "127.0.0.1 studio.poveroh.local"
        echo "127.0.0.1 db.poveroh.local"
        echo "127.0.0.1 redis.poveroh.local"
        echo "127.0.0.1 cdn.poveroh.local"
        echo "127.0.0.1 poveroh.local"
        echo "::1 app.poveroh.local"
        echo "::1 api.poveroh.local"
        echo "::1 studio.poveroh.local"
        echo "::1 db.poveroh.local"
        echo "::1 cdn.poveroh.local"
        echo "::1 redis.poveroh.local"
    } | sudo tee -a "$hosts_path" > /dev/null

    if [[ $? -eq 0 ]]; then
        echo "✅ Hosts entries added successfully."
    else
        echo "⚠️  Failed to update /etc/hosts. Please add the following entries manually:"
        echo "127.0.0.1 app.poveroh.local"
        echo "127.0.0.1 api.poveroh.local"
        echo "127.0.0.1 studio.poveroh.local"
        echo "127.0.0.1 db.poveroh.local"
        echo "127.0.0.1 redis.poveroh.local"
        echo "127.0.0.1 cdn.poveroh.local"
        echo "127.0.0.1 poveroh.local"
        echo "::1 app.poveroh.local"
        echo "::1 api.poveroh.local"
        echo "::1 studio.poveroh.local"
        echo "::1 db.poveroh.local"
        echo "::1 cdn.poveroh.local"
        echo "::1 redis.poveroh.local"
    fi
}

# Function to display the main menu
main_menu() {
    echo "What do you want to do?"
    echo "  1) Install"
    echo "  2) Start"
    echo "  3) Stop"
    echo "  4) Update"
    echo "  5) Exit"

    read -rp "Enter your choice [1-5]: " choice
    echo

    case "$choice" in
    1)
        ensure_hosts_entries
        download_files
        configure_env_file
        inject_platform_into_compose
        download_images
        exit 0
        ;;
    2)
        copy_env_file
        start_images
        exit 0
        ;;
    3)
        stop_images
        exit 0
        ;;
    4)
        stop_images 1
        download_images
        start_images
        exit 0
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option. Please try again."
        main_menu
        ;;
    esac
}

# Start the script
detect_architecture_and_configure
main_menu
