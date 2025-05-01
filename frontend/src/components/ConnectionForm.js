import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import { testCredentials, fetchPipelines } from '../services/api';

/**
 * ConnectionForm component for Elasticsearch credentials
 */
function ConnectionForm({ 
  credentials, 
  onCredentialsChange, 
  onConnectionSuccess, 
  isConnected = false
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onCredentialsChange({
      ...credentials,
      [name]: value
    });
  };

  // Test credentials
  const handleTestCredentials = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!credentials.url || !credentials.username || !credentials.password) {
      setError('Please fill in all credential fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Test credentials
      const result = await testCredentials(credentials);
      
      if (result.success) {
        setSuccess(result.message);
        
        // Fetch pipelines
        const pipelines = await fetchPipelines(credentials);
        onConnectionSuccess(pipelines);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="1. Elasticsearch Connection" 
        sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          '& .MuiCardHeader-title': {
            fontSize: '1.25rem'
          }
        }} 
      />

      <CardContent>
        {isConnected && (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1, mb: 2 }}>
            <CheckCircleIcon color="success" sx={{ mr: 2 }} />
            <Typography variant="body2">
              Connected to: <strong>{credentials.url}</strong> as <strong>{credentials.username}</strong>
            </Typography>
          </Box>
        )}

        <form onSubmit={handleTestCredentials}>
          <TextField
            fullWidth
            label="Elasticsearch URL"
            name="url"
            value={credentials.url}
            onChange={handleInputChange}
            variant="outlined"
            placeholder="https://your-cluster:9200"
            size="small"
            margin="dense"
            required
          />
          
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={credentials.username}
            onChange={handleInputChange}
            variant="outlined"
            placeholder="Username"
            size="small"
            margin="dense"
            required
          />
          
          <TextField
            fullWidth
            label="Password/API Key"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            variant="outlined"
            placeholder="Password or API Key"
            type="password"
            size="small"
            margin="dense"
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isConnected ? (
              'Update Connection'
            ) : (
              'Test Connection'
            )}
          </Button>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default ConnectionForm; 