#!/bin/bash

# Stop any running containers
echo "Stopping existing containers..."
sudo docker compose down

# Build the containers (no cache to ensure fresh builds)
echo "Building containers..."
sudo docker compose build # --no-cache

# Start the containers in detached mode
echo "Starting containers in production mode..."
sudo docker compose up -d

echo "Containers started successfully."
echo "Frontend available at: http://localhost"
echo "Backend API available at: http://localhost/api"
