import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import Looks6Icon from '@mui/icons-material/Looks6';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

/**
 * Help dialog component with instructions on using the app
 */
function HelpDialog({ open, onClose }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Help & Instructions
      </DialogTitle>
      
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>About This Application</AlertTitle>
          This application allows you to test Elasticsearch ingest pipelines by sending log data through a selected pipeline and viewing the transformed results.
        </Alert>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          How to Use This Application
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <LooksOneIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Enter your Elasticsearch cluster URL, username, and password/API key" 
              secondary="Click 'Test Credentials' to verify the connection"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <LooksTwoIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Select an ingest pipeline from the dropdown" 
              secondary="The dropdown is populated with all available pipelines from your cluster"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Looks3Icon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Upload a log file or paste log lines" 
              secondary="Each line will be processed as a separate document"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Looks4Icon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Click 'Process' to run the logs through the pipeline" 
              secondary="Large files are processed in batches of 20 lines"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Looks5Icon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="View the results side-by-side with the original logs" 
              secondary="Navigate through results with the navigation buttons"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Looks6Icon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Toggle between JSON and Key-Value views" 
              secondary="Copy individual results or export all results as needed"
            />
          </ListItem>
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default HelpDialog; 