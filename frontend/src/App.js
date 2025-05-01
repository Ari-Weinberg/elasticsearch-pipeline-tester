import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Header from './components/Header';
import ConnectionForm from './components/ConnectionForm';
import PipelineSelector from './components/PipelineSelector';
import LogInput from './components/LogInput';
import ResultsViewer from './components/ResultsViewer';
import HelpDialog from './components/HelpDialog';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// Create a dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4ECDC4',
    },
    secondary: {
      main: '#2FBF71',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    error: {
      main: '#CF6679',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 500,
          letterSpacing: '0.5px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  // Application state
  const [credentials, setCredentials] = useState({
    url: '',
    username: '',
    password: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState('');
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('json'); // 'json' or 'kv'
  const [helpOpen, setHelpOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    connection: true,
    pipeline: false,
    logInput: false,
    results: false
  });

  // Handle credential updates
  const handleCredentialsChange = (newCredentials) => {
    setCredentials(newCredentials);
  };

  // Handle successful connection
  const handleConnectionSuccess = (pipelineList) => {
    setIsConnected(true);
    setPipelines(pipelineList);
    // Collapse connection section and expand pipeline section
    setExpandedSections({
      ...expandedSections,
      connection: false,
      pipeline: true
    });
  };

  // Handle pipeline selection
  const handlePipelineSelect = (pipelineId) => {
    setSelectedPipeline(pipelineId);
    // Collapse pipeline section and expand log input section
    setExpandedSections({
      ...expandedSections,
      pipeline: false,
      logInput: true
    });
  };

  // Handle log input
  const handleLogsChange = (logLines) => {
    setLogs(logLines);
  };

  // Handle processing results
  const handleResults = (processedResults) => {
    setResults(processedResults);
    setCurrentIndex(0);
    setProcessing(false);
    // Collapse log input section and expand results section
    setExpandedSections({
      ...expandedSections,
      logInput: false,
      results: true
    });
  };

  // Handle help dialog
  const toggleHelp = () => {
    setHelpOpen(!helpOpen);
  };

  // Clear session/state
  const handleClearSession = () => {
    setCredentials({
      url: '',
      username: '',
      password: '',
    });
    setIsConnected(false);
    setPipelines([]);
    setSelectedPipeline('');
    setLogs([]);
    setResults([]);
    setCurrentIndex(0);
    // Reset section expansion state
    setExpandedSections({
      connection: true,
      pipeline: false,
      logInput: false,
      results: false
    });
    setProcessing(false);
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header 
        onHelpClick={toggleHelp} 
        onClearClick={handleClearSession} 
      />
      <Box 
        sx={{
          display: 'flex',
          height: 'calc(100vh - 64px)', // Full height minus header
          overflow: 'hidden'
        }}
      >
        {/* Sidebar - 25% width */}
        <Box 
          sx={{ 
            width: '25%', 
            height: '100%', 
            overflow: 'auto',
            padding: 2,
            borderRight: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <ConnectionForm 
            credentials={credentials}
            onCredentialsChange={handleCredentialsChange}
            onConnectionSuccess={handleConnectionSuccess}
            expanded={expandedSections.connection}
            onToggleExpand={() => toggleSection('connection')}
            isConnected={isConnected}
          />

          {isConnected && (
            <PipelineSelector 
              pipelines={pipelines}
              selectedPipeline={selectedPipeline}
              onPipelineSelect={handlePipelineSelect}
              expanded={expandedSections.pipeline}
              onToggleExpand={() => toggleSection('pipeline')}
            />
          )}

          {isConnected && selectedPipeline && (
            <LogInput 
              onLogsChange={handleLogsChange}
              credentials={credentials}
              selectedPipeline={selectedPipeline}
              onProcessingStart={() => setProcessing(true)}
              onProcessingComplete={handleResults}
              expanded={expandedSections.logInput}
              onToggleExpand={() => toggleSection('logInput')}
            />
          )}
        </Box>

        {/* Results Area - 75% width */}
        <Box 
          sx={{ 
            width: '75%', 
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {results.length > 0 ? (
            <ResultsViewer 
              results={results}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              viewMode={viewMode}
              setViewMode={setViewMode}
              expanded={expandedSections.results}
              onToggleExpand={() => toggleSection('results')}
              fullHeight
            />
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                backgroundColor: 'background.paper',
                color: 'text.secondary',
                padding: 4,
                textAlign: 'center'
              }}
            >
              {isConnected && selectedPipeline ? (
                processing ? (
                  <>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography>
                      Processing logs... Please wait.
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      Processing progress is shown in the sidebar.
                    </Typography>
                  </>
                ) : (
                  "Upload or paste logs and click 'Process' to see results here"
                )
              ) : (
                "Connect to Elasticsearch and select a pipeline to begin"
              )}
            </Box>
          )}
        </Box>
      </Box>

      <HelpDialog open={helpOpen} onClose={toggleHelp} />
    </ThemeProvider>
  );
}

export default App; 