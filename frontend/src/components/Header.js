import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

/**
 * Header component with app title and action buttons
 */
function Header({ onHelpClick, onClearClick }) {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 500
          }}
        >
          Elasticsearch Ingest Pipeline Tester
        </Typography>
        
        <Box>
          <Button 
            color="inherit" 
            onClick={onHelpClick}
            startIcon={<HelpOutlineIcon />}
          >
            Help
          </Button>
          
          <Button 
            color="inherit" 
            onClick={onClearClick}
            startIcon={<DeleteOutlineIcon />}
            sx={{ ml: 1 }}
          >
            Clear
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 