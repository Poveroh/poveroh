#!/bin/bash

# Global variables
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"
ENV_FILE="$PROJECT_ROOT/poveroh.env"
GITHUB_REPO_URL="https://raw.githubusercontent.com/Poveroh/poveroh/main"

# Download a file from GitHub
fetch_file_from_github() {
    local file_path="$1"
    local destination="$2"

    echo "Fetching $file_path from GitHub..."
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

# Detect system architecture
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

# Download necessary configuration files
download_files() {
    echo "Starting file download process..."

    if [[ ! -f "$COMPOSE_FILE" ]]; then
        echo "Downloading docker-compose.prod.yml file..."
        fetch_file_from_github "docker/docker-compose.prod.yml" "$COMPOSE_FILE"
    else
        echo "docker-compose.prod.yml already exists. Skipping download."
    fi

    if [[ ! -f "$ENV_FILE" ]]; then
        echo "Downloading .env.prod.example file..."
        fetch_file_from_github ".env.prod.example" "$ENV_FILE"
    else
        echo "$ENV_FILE already exists. Skipping download."
    fi

    echo "All necessary files are downloaded."
}

# Pull Docker images
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

# Configure environment variables
configure_env_file() {
    echo "Configuring environment file..."

    # Generate JWT_KEY if empty
    if grep -q '^JWT_KEY=' "$ENV_FILE"; then
        local current_jwt_key
        current_jwt_key=$(grep '^JWT_KEY=' "$ENV_FILE" | cut -d '=' -f 2)
        if [[ -z "$current_jwt_key" ]]; then
            echo "JWT_KEY is empty. Generating a new key..."
            local jwt_key
            jwt_key=$(openssl rand -hex 32)
            sed -i '' "s|^JWT_KEY=.*|JWT_KEY=$jwt_key|" "$ENV_FILE" 2>/dev/null || \
            sed -i "s|^JWT_KEY=.*|JWT_KEY=$jwt_key|" "$ENV_FILE"
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

    # Set CDN_LOCAL_DATA_PATH
    if ! grep -q '^CDN_LOCAL_DATA_PATH=' "$ENV_FILE"; then
        echo "Adding CDN_LOCAL_DATA_PATH to $ENV_FILE..."
        echo "CDN_LOCAL_DATA_PATH=$PROJECT_ROOT/cdn-data" >>"$ENV_FILE"
    else
        echo "Updating CDN_LOCAL_DATA_PATH in $ENV_FILE..."
        sed -i '' "s|^CDN_LOCAL_DATA_PATH=.*|CDN_LOCAL_DATA_PATH=$PROJECT_ROOT/cdn-data|" "$ENV_FILE" 2>/dev/null || \
        sed -i "s|^CDN_LOCAL_DATA_PATH=.*|CDN_LOCAL_DATA_PATH=$PROJECT_ROOT/cdn-data|" "$ENV_FILE"
    fi

    # Create cdn-data directory
    mkdir -p "$PROJECT_ROOT/cdn-data"

    # Add IMAGE_ARCH
    if ! grep -q '^IMAGE_ARCH=' "$ENV_FILE"; then
        echo "Adding IMAGE_ARCH to $ENV_FILE..."
        echo "IMAGE_ARCH=$IMAGE_ARCH" >> "$ENV_FILE"
    else
        echo "Updating IMAGE_ARCH in $ENV_FILE..."
        sed -i '' "s|^IMAGE_ARCH=.*|IMAGE_ARCH=$IMAGE_ARCH|" "$ENV_FILE" 2>/dev/null || \
        sed -i "s|^IMAGE_ARCH=.*|IMAGE_ARCH=$IMAGE_ARCH|" "$ENV_FILE"
    fi

    copy_env_file
    echo "Environment file configured successfully."
}

# Copy env file to .env
copy_env_file() {
    cp "$ENV_FILE" "$PROJECT_ROOT/.env"
}

# Start Docker containers
start_images() {
    echo "Starting Docker containers..."
    docker network ls | grep -w poveroh_network || {
        echo "Creating Docker network poveroh_network..."
        docker network create poveroh_network
    }

    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    if [[ $? -eq 0 ]]; then
        echo "✅ Docker containers started successfully."
        echo "🚀 App is running at http://app.poveroh.local"
    else
        echo "Error: Failed to start Docker containers."
        exit 1
    fi
}

# Stop Docker containers
stop_images() {
    echo "Preparing to stop Docker images..."
    local stop_choice="$1"

    if [[ -z "$stop_choice" ]]; then
        echo "1) Stop all images"
        echo "2) Stop specific images"
        read -rp "Enter your choice [1-2]: " stop_choice
    fi

    case "$stop_choice" in
        1)
            docker compose -f "$COMPOSE_FILE" down
            echo "All images stopped successfully."
            ;;
        2)
            echo "Enter the names of the services to stop (separated by space):"
            read -r services_to_stop
            docker compose -f "$COMPOSE_FILE" stop $services_to_stop
            echo "Selected services stopped successfully."
            ;;
        *)
            echo "Invalid option."
            ;;
    esac
}

# Inject platform configuration correctly into docker-compose.prod.yml
inject_platform_into_compose() {
    echo "Injecting platform configuration into $COMPOSE_FILE..."

    if [[ "$IMAGE_ARCH" != "amd64" ]]; then
        echo "No platform injection needed for architecture: $IMAGE_ARCH."
        return 0
    fi

    # Create backup
    cp "$COMPOSE_FILE" "$COMPOSE_FILE.bak"

    # Correctly inject "platform: linux/amd64" under each "image:" line with proper indentation
    awk '
    /image:/ {
        print $0
        print "        platform: linux/amd64"
        next
    }
    { print }
    ' "$COMPOSE_FILE" > "$COMPOSE_FILE.tmp" && mv "$COMPOSE_FILE.tmp" "$COMPOSE_FILE"

    echo "✅ Platform linux/amd64 injected correctly under all services."
}

# Ensure required hosts entries
ensure_hosts_entries() {
    echo "Ensuring hosts entries in /etc/hosts..."

    local hosts_path="/etc/hosts"
    local entries=(
        "127.0.0.1 app.poveroh.local"
        "127.0.0.1 api.poveroh.local"
        "127.0.0.1 studio.poveroh.local"
        "127.0.0.1 db.poveroh.local"
        "127.0.0.1 redis.poveroh.local"
        "127.0.0.1 cdn.poveroh.local"
        "127.0.0.1 poveroh.local"
        "::1 app.poveroh.local"
        "::1 api.poveroh.local"
        "::1 studio.poveroh.local"
        "::1 db.poveroh.local"
        "::1 cdn.poveroh.local"
        "::1 redis.poveroh.local"
    )

    if grep -q "app.poveroh.local" "$hosts_path" 2>/dev/null; then
        echo "✅ Hosts entries already exist. Skipping update."
        return 0
    fi

    echo "Adding entries to /etc/hosts..."
    echo "⚠️  This may require administrator privileges (UAC prompt on Windows/WSL)."

    local block=$'\n# Poveroh local domains\n'
    for entry in "${entries[@]}"; do
        block+="$entry\n"
    done

    if echo "$block" | sudo tee -a "$hosts_path" > /dev/null 2>&1; then
        echo "✅ Hosts entries added successfully."
    else
        echo "⚠️  Failed to update /etc/hosts automatically."
        echo "➕ Please add the following lines manually to $hosts_path:"
        echo "$block"
        echo "After adding, restart your browser and run the script with option 2 (Start)."
    fi
}

# Generate locally-trusted TLS certificates
ensure_ssl() {
    local ssl_dir="$PROJECT_ROOT/ssl"
    local crt="$ssl_dir/poveroh.local.crt"
    local key="$ssl_dir/poveroh.local.key"

    if [[ -f "$crt" && -f "$key" ]]; then
        echo "ℹ️  SSL certificates already exist at $ssl_dir. Skipping generation."
        return
    fi

    mkdir -p "$ssl_dir"

    if ! command -v mkcert >/dev/null 2>&1; then
        echo "🔍 mkcert not found — attempting to install it..."
        case "$(uname -s)" in
            Darwin)
                if command -v brew >/dev/null 2>&1; then
                    brew install mkcert nss
                else
                    echo "❌ Homebrew not found. Install mkcert manually."
                    exit 1
                fi
                ;;
            Linux)
                if command -v apt-get >/dev/null 2>&1; then
                    sudo apt-get update && sudo apt-get install -y libnss3-tools mkcert || true
                fi
                if ! command -v mkcert >/dev/null 2>&1; then
                    echo "📦 Downloading mkcert binary..."
                    # ... (download logic remains the same)
                fi
                ;;
            *)
                echo "❌ Unsupported OS. Install mkcert manually: https://github.com/FiloSottile/mkcert"
                exit 1
                ;;
        esac
    fi

    mkcert -install
    mkcert -cert-file "$crt" -key-file "$key" "*.poveroh.local" poveroh.local
    echo "✅ SSL certificates generated at $ssl_dir."
}

# Main menu
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
        ensure_ssl
        download_files
        configure_env_file
        inject_platform_into_compose
        download_images
        echo "✅ Installation completed!"
        ;;
    2)
        copy_env_file
        ensure_ssl
        start_images
        ;;
    3)
        stop_images
        ;;
    4)
        stop_images 1
        ensure_ssl
        download_images
        start_images
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
