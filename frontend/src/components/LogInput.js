import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinearProgress from '@mui/material/LinearProgress';
import { uploadFile, processLogs } from '../services/api';

// Tab panel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`log-input-tabpanel-${index}`}
      aria-labelledby={`log-input-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * LogInput component for uploading files or pasting logs
 */
function LogInput({ 
  onLogsChange, 
  credentials, 
  selectedPipeline, 
  onProcessingStart, 
  onProcessingComplete
}) {
  const [tabValue, setTabValue] = useState(0);
  const [pastedLogs, setPastedLogs] = useState('');
  const [fileDetails, setFileDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [uploadedLogLines, setUploadedLogLines] = useState([]);
  const [processed, setProcessed] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ 
    current: 0, 
    total: 0, 
    percentComplete: 0 
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle paste input change
  const handlePasteChange = (e) => {
    setPastedLogs(e.target.value);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['text/plain', 'application/json', 'text/csv'];
    if (!validTypes.includes(file.type) && 
        !file.name.endsWith('.txt') && 
        !file.name.endsWith('.json') && 
        !file.name.endsWith('.csv')) {
      setFileError('Invalid file type. Please upload a TXT, JSON, or CSV file.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File too large. Maximum size is 10MB.');
      return;
    }
    
    setFileError('');
    setUploading(true);
    
    try {
      // Upload and parse file
      const logLines = await uploadFile(file);
      
      // Store file details
      setFileDetails({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        lines: logLines.length
      });
      
      // Store the log lines in state for processing
      setUploadedLogLines(logLines);
      
      // Update logs in parent component
      onLogsChange(logLines);
    } catch (err) {
      setFileError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Process logs through pipeline
  const handleProcessLogs = async () => {
    // Validate inputs
    if (tabValue === 0 && !fileDetails) {
      setError('Please upload a file first');
      return;
    }
    
    if (tabValue === 1 && !pastedLogs) {
      setError('Please paste some logs first');
      return;
    }
    
    setLoading(true);
    setError('');
    setProcessed(false);
    onProcessingStart();
    
    try {
      let logs;
      let inputType;
      let totalLines = 0;
      
      if (tabValue === 0) {
        // Use the uploaded file logs, joining them into a string
        inputType = 'paste'; // Send as paste to avoid empty logs error
        logs = uploadedLogLines.join('\n');
        totalLines = uploadedLogLines.length;
      } else {
        // Using pasted logs
        inputType = 'paste';
        logs = pastedLogs;
        totalLines = pastedLogs.split('\n').filter(line => line.trim()).length;
      }
      
      // Initialize progress tracking
      setProcessingProgress({
        current: 0,
        total: totalLines,
        percentComplete: 0
      });
      
      // Process logs through pipeline with progress tracking
      const batchSize = 20; // Same as backend batch size
      const results = [];
      
      // If there are many log lines, process them in batches to show progress
      if (totalLines > batchSize) {
        const logLines = tabValue === 0 ? uploadedLogLines : pastedLogs.split('\n').filter(line => line.trim());
        
        for (let i = 0; i < logLines.length; i += batchSize) {
          const batch = logLines.slice(i, i + batchSize);
          const batchContent = batch.join('\n');
          
          // Process batch
          const batchResults = await processLogs({
            credentials,
            pipeline_id: selectedPipeline,
            logs: batchContent,
            input_type: 'paste'
          });
          
          // Add batch results to full results
          results.push(...batchResults);
          
          // Update progress
          const processed = Math.min(i + batchSize, totalLines);
          setProcessingProgress({
            current: processed,
            total: totalLines,
            percentComplete: Math.round((processed / totalLines) * 100)
          });
        }
      } else {
        // For smaller log sets, process all at once
        const allResults = await processLogs({
          credentials,
          pipeline_id: selectedPipeline,
          logs,
          input_type: inputType
        });
        
        results.push(...allResults);
        
        // Update progress to complete
        setProcessingProgress({
          current: totalLines,
          total: totalLines,
          percentComplete: 100
        });
      }
      
      // Mark as processed
      setProcessed(true);
      
      // Pass results to parent component
      onProcessingComplete(results);
    } catch (err) {
      setError(err.message);
      onProcessingComplete([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="3. Log Input" 
        sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          '& .MuiCardHeader-title': {
            fontSize: '1.25rem'
          }
        }} 
      />
      
      <CardContent>
        {processed && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircleIcon color="success" sx={{ mr: 2 }} />
            <Typography variant="body2">
              {tabValue === 0 && fileDetails ? (
                <>Processed file: <strong>{fileDetails.name}</strong> ({fileDetails.lines} lines)</>
              ) : (
                <>Processed <strong>{pastedLogs.split('\n').length}</strong> log lines</>
              )}
            </Typography>
          </Box>
        )}
        
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="log input tabs"
          variant="fullWidth"
          sx={{ mb: 1 }}
        >
          <Tab label="Upload File" />
          <Tab label="Paste Logs" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={uploading}
              size="small"
              fullWidth
            >
              {uploading ? 'Uploading...' : 'Upload Log File'}
              <input 
                type="file" 
                hidden 
                accept=".txt,.json,.csv,text/plain,application/json,text/csv" 
                onChange={handleFileUpload} 
              />
            </Button>
            
            {fileDetails && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" display="block">
                  File: {fileDetails.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Size: {fileDetails.size} | Lines: {fileDetails.lines}
                </Typography>
              </Box>
            )}
            
            {fileError && (
              <Alert severity="error" sx={{ mt: 1 }} size="small">
                {fileError}
              </Alert>
            )}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TextField
            label="Paste Logs (one per line)"
            multiline
            rows={5}
            fullWidth
            value={pastedLogs}
            onChange={handlePasteChange}
            variant="outlined"
            placeholder="Paste your log lines here, one per line"
            size="small"
          />
        </TabPanel>
        
        {error && (
          <Alert severity="error" sx={{ mt: 1 }} size="small">
            {error}
          </Alert>
        )}
        
        {loading && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">
                Processing logs...
              </Typography>
              <Typography variant="caption">
                {processingProgress.current} of {processingProgress.total} ({processingProgress.percentComplete}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={processingProgress.percentComplete} 
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          onClick={handleProcessLogs}
          disabled={
            loading || 
            !selectedPipeline || 
            (tabValue === 0 && !fileDetails) || 
            (tabValue === 1 && !pastedLogs)
          }
          fullWidth
          sx={{ mt: 2 }}
          size="small"
        >
          {loading ? 'Processing...' : 'Process'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default LogInput; 