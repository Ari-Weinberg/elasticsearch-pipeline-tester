import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

// Icons
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import DataObjectIcon from '@mui/icons-material/DataObject';

// JSON Viewer
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

// Key Value View component (recursive)
const KeyValueView = ({ data, level = 0 }) => {
  // Handle different data types
  if (data === null) {
    return <Typography color="text.secondary">null</Typography>;
  }
  
  if (typeof data === 'undefined') {
    return <Typography color="text.secondary">undefined</Typography>;
  }
  
  if (typeof data !== 'object') {
    return <Typography>{String(data)}</Typography>;
  }
  
  // For arrays and objects
  return (
    <Box sx={{ ml: level > 0 ? 2 : 0 }}>
      {Object.entries(data).map(([key, value]) => (
        <Box key={key} sx={{ mb: 1 }}>
          <Typography 
            component="span" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            {key}:
          </Typography>
          
          {typeof value === 'object' && value !== null ? (
            <Box sx={{ mt: 0.5 }}>
              <KeyValueView data={value} level={level + 1} />
            </Box>
          ) : (
            <Typography 
              component="span" 
              sx={{ ml: 1 }}
            >
              {value === null ? 'null' : String(value)}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

/**
 * ResultsViewer component for displaying original and transformed logs
 */
function ResultsViewer({ 
  results, 
  currentIndex, 
  setCurrentIndex, 
  viewMode, 
  setViewMode,
  fullHeight = false
}) {
  // Handle no results
  if (!results || results.length === 0) {
    return null;
  }
  
  // The current result
  const result = results[currentIndex];
  
  // Handle navigation
  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex(Math.min(results.length - 1, currentIndex + 1));
  };
  
  const handleSkipBack = () => {
    setCurrentIndex(Math.max(0, currentIndex - 10));
  };
  
  const handleSkipForward = () => {
    setCurrentIndex(Math.min(results.length - 1, currentIndex + 10));
  };
  
  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = (content) => {
    navigator.clipboard.writeText(
      typeof content === 'object' ? JSON.stringify(content, null, 2) : content
    );
  };
  
  // Handle download all results
  const handleDownload = () => {
    // Create a JSON blob with all transformed results
    const transformedResults = results.map(r => r.processed_doc || r.error_message);
    const blob = new Blob([JSON.stringify(transformedResults, null, 2)], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformed_results.json';
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: fullHeight ? '100%' : 'auto',
        bgcolor: 'background.paper',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar with Controls */}
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Results: Line {currentIndex + 1} of {results.length}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="json" aria-label="json view">
                <Tooltip title="JSON View">
                  <DataObjectIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="kv" aria-label="key-value view">
                <Tooltip title="Key-Value View">
                  <ViewStreamIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Tooltip title="Download All Results">
              <IconButton onClick={handleDownload} color="primary" size="small">
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        
        {/* Navigation Controls */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 1,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={handleSkipBack}
              disabled={currentIndex === 0}
              startIcon={<KeyboardDoubleArrowLeftIcon />}
            >
              -10
            </Button>
            <Button 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <NavigateBeforeIcon />
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === results.length - 1}
            >
              <NavigateNextIcon />
            </Button>
            <Button
              onClick={handleSkipForward}
              disabled={currentIndex === results.length - 1}
              endIcon={<KeyboardDoubleArrowRightIcon />}
            >
              +10
            </Button>
          </ButtonGroup>
        </Box>
      </AppBar>
      
      {/* Content Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          pt: 2,
          px: 2
        }}
      >
        {/* Original Log */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, pr: { xs: 0, md: 1 }, mb: { xs: 2, md: 0 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Original Log
          </Typography>
          
          <Paper 
            variant="outlined" 
            sx={{ 
              flexGrow: 1,
              p: 2, 
              overflow: 'auto',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              position: 'relative',
              '&:hover .copy-button': {
                opacity: 1
              }
            }}
          >
            <Tooltip title="Copy to clipboard">
              <IconButton 
                size="small" 
                className="copy-button"
                onClick={() => handleCopy(result.original_log)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  backgroundColor: 'rgba(0,0,0,0.3)'
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {result.original_log}
          </Paper>
        </Box>
        
        {/* Transformed Output */}
        <Box sx={{ width: { xs: '100%', md: '50%' }, pl: { xs: 0, md: 1 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Transformed Output
          </Typography>
          
          {result.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {result.error_message || 'Unknown error'}
            </Alert>
          ) : (
            <Paper 
              variant="outlined" 
              sx={{ 
                flexGrow: 1,
                p: 2, 
                overflow: 'auto',
                position: 'relative',
                '&:hover .copy-button': {
                  opacity: 1
                }
              }}
            >
              <Tooltip title="Copy to clipboard">
                <IconButton 
                  size="small" 
                  className="copy-button"
                  onClick={() => handleCopy(result.processed_doc)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex: 10
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              {viewMode === 'json' ? (
                <JsonView 
                  data={result.processed_doc || {}} 
                  style={darkStyles}
                />
              ) : (
                <KeyValueView data={result.processed_doc || {}} />
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ResultsViewer; 