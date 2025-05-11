# Elasticsearch Ingest Pipeline Tester

A modern web application for testing Elasticsearch ingest pipelines by sending log data through a selected pipeline and viewing the transformed results.

### Note: This appliction was almost fully vibe coded. Definitely dont expose this to the internet.

## Features

- Connect to Elasticsearch clusters using credentials
- Select from available ingest pipelines
- Upload log files (txt, JSON, CSV) or paste log lines directly
- Process logs through the selected pipeline using the Elasticsearch simulate API
- View side-by-side comparison of original logs and transformed outputs
- Toggle between JSON view and Key-Value view for transformed results
- Navigate through results with pagination controls
- Export transformed results as JSON

![pic6.png]()

## Requirements

- Docker and Docker Compose

## Running the Application

Build and start the application using Docker:

```bash
# Clone the repository
git clone https://github.com/your-username/elasticsearch-pipeline-tester.git
cd elasticsearch-pipeline-tester

# Build and run with Docker Compose
./rebuild-containers.sh
```

Or run the Docker commands manually:

```bash
# Stop any running containers
docker compose down

# Build the containers
docker compose build --no-cache

# Start the containers
docker compose up -d
```

Access the application at:
http://localhost:8080

## Usage

1. Enter your Elasticsearch cluster URL, username, and password/API key
2. Click "Test Credentials" to validate the connection
3. Select an ingest pipeline from the dropdown
4. Upload a log file or paste log lines
5. Click "Process" to run the logs through the pipeline
6. Use the navigation buttons to browse results
7. Toggle between JSON and Key-Value views
8. Export results as needed

## Limitations

- Files are processed in batches of 20 lines.
- One log entry per line is expected. 
- Max of 1000 lines, but even that will likely take too long to process.