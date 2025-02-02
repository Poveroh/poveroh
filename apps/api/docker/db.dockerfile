FROM postgres:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=poveroh
ENV POSTGRES_DB=poveroh

# Expose the default PostgreSQL port
EXPOSE 5432