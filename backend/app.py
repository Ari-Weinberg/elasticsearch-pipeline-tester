from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename
from elasticsearch import Elasticsearch
from typing import List, Dict, Any, Union, Tuple

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set maximum file size to 10MB
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# Elasticsearch credential validation
def validate_credentials(url: str, username: str, password: str) -> Tuple[bool, str, Elasticsearch]:
    """
    Validate Elasticsearch credentials by making a test API call.
    
    Args:
        url: Elasticsearch cluster URL
        username: Elasticsearch username
        password: Elasticsearch password or API key
        
    Returns:
        Tuple containing:
            - Boolean indicating if credentials are valid
            - Message with success or error details
            - Elasticsearch client object if successful, None if failed
    """
    try:
        # Create Elasticsearch client
        es = Elasticsearch(
            url,
            basic_auth=(username, password),
            verify_certs=False,  # For development; should be configurable in production
            request_timeout=30
        )
        
        # Test connection with cluster health API
        health = es.cluster.health()
        
        # If we get here, credentials are valid
        return True, f"Connected to cluster: {health.get('cluster_name')}", es
    except Exception as e:
        # Handle authentication or connection errors
        error_msg = str(e)
        if "unauthorized" in error_msg.lower() or "authentication" in error_msg.lower():
            return False, "Invalid credentials. Please check your username and password.", None
        else:
            return False, f"Connection error: {error_msg}", None

# Fetch pipelines
def fetch_pipelines(es_client: Elasticsearch) -> List[str]:
    """
    Fetch available ingest pipelines from Elasticsearch.
    
    Args:
        es_client: Authenticated Elasticsearch client
        
    Returns:
        List of pipeline IDs
    """
    try:
        # Call the ingest pipeline API
        response = es_client.ingest.get_pipeline()
        
        # Extract pipeline IDs from response
        pipeline_ids = list(response.keys())
        
        return pipeline_ids
    except Exception as e:
        # Handle API errors
        raise Exception(f"Failed to fetch pipelines: {str(e)}")

# Parse logs
def parse_logs(input_data: Any, input_type: str) -> List[str]:
    """
    Parse log data from file upload or text paste.
    
    Args:
        input_data: Uploaded file data or pasted text
        input_type: 'file' or 'paste'
        
    Returns:
        List of log lines (strings)
    """
    log_lines = []
    
    try:
        if input_type == 'file':
            # Handle uploaded file
            log_lines = [line.strip() for line in input_data.splitlines() if line.strip()]
        elif input_type == 'paste':
            # Handle pasted text
            log_lines = [line.strip() for line in input_data.splitlines() if line.strip()]
        
        return log_lines
    except Exception as e:
        raise Exception(f"Failed to parse logs: {str(e)}")

# Process logs through pipeline
def simulate_pipeline(es_client: Elasticsearch, pipeline_id: str, log_lines: List[str]) -> List[Dict[str, Any]]:
    """
    Process log lines through an Elasticsearch ingest pipeline simulation.
    
    Args:
        es_client: Authenticated Elasticsearch client
        pipeline_id: ID of the pipeline to use
        log_lines: List of log lines to process
        
    Returns:
        List of transformed documents or error information
    """
    try:
        # Prepare documents for the simulate API
        docs = [{"_source": {"message": log_line}} for log_line in log_lines]
        
        # Call the simulate API
        response = es_client.ingest.simulate(
            id=pipeline_id,
            docs=docs
        )
        
        # Extract transformed documents from the response
        results = []
        for i, doc in enumerate(response.get('docs', [])):
            result = {
                'original_log': log_lines[i] if i < len(log_lines) else None
            }
            
            if 'error' in doc:
                # Handle document-level processing errors
                result.update({
                    'error': True,
                    'error_message': doc.get('error', {}).get('reason', 'Unknown error'),
                    'processed_doc': None
                })
            else:
                # Extract successfully processed document
                result.update({
                    'error': False,
                    'error_message': None,
                    'processed_doc': doc.get('doc', {}).get('_source', {})
                })
            
            results.append(result)
        
        return results
    except Exception as e:
        # Handle API errors
        raise Exception(f"Pipeline simulation failed: {str(e)}")

# API Routes

@app.route('/api/test-credentials', methods=['POST'])
def test_credentials():
    """Test Elasticsearch connection credentials"""
    try:
        data = request.json
        url = data.get('url')
        username = data.get('username')
        password = data.get('password')
        
        if not url or not username or not password:
            return jsonify({
                'success': False,
                'message': 'Missing required credential fields'
            }), 400
        
        valid, message, _ = validate_credentials(url, username, password)
        
        return jsonify({
            'success': valid,
            'message': message
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/pipelines', methods=['POST'])
def get_pipelines():
    """Fetch available pipelines"""
    try:
        data = request.json
        url = data.get('url')
        username = data.get('username')
        password = data.get('password')
        
        if not url or not username or not password:
            return jsonify({
                'success': False,
                'message': 'Missing required credential fields'
            }), 400
        
        valid, message, es_client = validate_credentials(url, username, password)
        
        if not valid:
            return jsonify({
                'success': False,
                'message': message
            }), 401
        
        pipelines = fetch_pipelines(es_client)
        
        return jsonify({
            'success': True,
            'pipelines': pipelines
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/simulate', methods=['POST'])
def simulate():
    """Process logs through selected pipeline"""
    try:
        # Get credentials from request
        data = request.json
        url = data.get('url')
        username = data.get('username')
        password = data.get('password')
        pipeline_id = data.get('pipeline_id')
        logs = data.get('logs', [])
        input_type = data.get('input_type', 'paste')
        
        if not url or not username or not password:
            return jsonify({
                'success': False,
                'message': 'Missing required credential fields'
            }), 400
        
        if not pipeline_id:
            return jsonify({
                'success': False,
                'message': 'Pipeline ID is required'
            }), 400
        
        if not logs:
            return jsonify({
                'success': False,
                'message': 'No logs provided'
            }), 400
        
        # Validate credentials
        valid, message, es_client = validate_credentials(url, username, password)
        
        if not valid:
            return jsonify({
                'success': False,
                'message': message
            }), 401
        
        # Process logs
        log_lines = parse_logs(logs, input_type)
        
        if not log_lines:
            return jsonify({
                'success': False,
                'message': 'No valid log lines found'
            }), 400
        
        # Process in batches of 100 lines
        batch_size = 20
        results = []
        
        for i in range(0, len(log_lines), batch_size):
            batch = log_lines[i:i + batch_size]
            batch_results = simulate_pipeline(es_client, pipeline_id, batch)
            results.extend(batch_results)
        
        return jsonify({
            'success': True,
            'results': results
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file part in the request'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        if file:
            # Read file content
            file_content = file.read().decode('utf-8')
            
            # Parse log lines
            log_lines = parse_logs(file_content, 'file')
            
            return jsonify({
                'success': True,
                'log_lines': log_lines,
                'line_count': len(log_lines)
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 