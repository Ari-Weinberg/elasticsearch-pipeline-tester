import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';

/**
 * PipelineSelector component for selecting Elasticsearch ingest pipelines
 */
function PipelineSelector({ 
  pipelines, 
  selectedPipeline, 
  onPipelineSelect
}) {
  // Check if pipelines list is empty
  if (!pipelines || pipelines.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="2. Pipeline Selection" 
          sx={{ 
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            '& .MuiCardHeader-title': {
              fontSize: '1.25rem'
            }
          }} 
        />
        <CardContent>
          <Alert severity="info">
            No pipelines found in the cluster. Please create at least one ingest pipeline to continue.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Handle pipeline selection
  const handlePipelineChange = (event, newValue) => {
    onPipelineSelect(newValue);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="2. Pipeline Selection" 
        sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          '& .MuiCardHeader-title': {
            fontSize: '1.25rem'
          }
        }} 
      />
      
      <CardContent>
        {selectedPipeline && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleIcon color="success" sx={{ mr: 2 }} />
            <Typography variant="body2">
              Selected: <strong>{selectedPipeline}</strong>
            </Typography>
          </Box>
        )}
        
        <Autocomplete
          value={selectedPipeline}
          onChange={handlePipelineChange}
          options={pipelines}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Select Pipeline" 
              variant="outlined"
              placeholder="Search or select a pipeline"
              size="small"
            />
          )}
          fullWidth
        />
      </CardContent>
    </Card>
  );
}

export default PipelineSelector; 