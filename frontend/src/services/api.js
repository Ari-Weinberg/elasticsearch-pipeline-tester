import axios from 'axios';

// Base URL for API - uses proxy in development
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

/**
 * Test Elasticsearch credentials
 * @param {Object} credentials - Elasticsearch credentials
 * @param {string} credentials.url - Elasticsearch URL
 * @param {string} credentials.username - Elasticsearch username
 * @param {string} credentials.password - Elasticsearch password/API key
 * @returns {Promise} - Promise resolving to the API response
 */
export const testCredentials = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/test-credentials`, credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to test credentials');
    }
    throw new Error('Network error while testing credentials');
  }
};

/**
 * Fetch pipelines from Elasticsearch
 * @param {Object} credentials - Elasticsearch credentials
 * @returns {Promise} - Promise resolving to an array of pipeline IDs
 */
export const fetchPipelines = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/pipelines`, credentials);
    return response.data.pipelines;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch pipelines');
    }
    throw new Error('Network error while fetching pipelines');
  }
};

/**
 * Process logs through a pipeline
 * @param {Object} params - Processing parameters
 * @param {Object} params.credentials - Elasticsearch credentials
 * @param {string} params.pipeline_id - Pipeline ID
 * @param {string} params.logs - Log content
 * @param {string} params.input_type - 'file' or 'paste'
 * @returns {Promise} - Promise resolving to the processing results
 */
export const processLogs = async ({ credentials, pipeline_id, logs, input_type = 'paste' }) => {
  try {
    const response = await axios.post(`${API_URL}/simulate`, {
      ...credentials,
      pipeline_id,
      logs,
      input_type
    });
    return response.data.results;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to process logs');
    }
    throw new Error('Network error while processing logs');
  }
};

/**
 * Upload a log file
 * @param {File} file - The file to upload
 * @returns {Promise} - Promise resolving to the parsed log lines
 */
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.log_lines;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to upload file');
    }
    throw new Error('Network error while uploading file');
  }
}; 