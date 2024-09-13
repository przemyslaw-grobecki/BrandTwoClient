import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Divider } from '@mui/material';
import { Devices, People, Science, Archive, Info } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import DevicesPage from '../DevicesPage';
import UsersPage from '../UsersPage';
import ExperimentsPage from '../ExperimentsPage';
import ArchivedPage from '../ArchivedPage';
import GeneralInfoPage from 'pages/GeneralInfoPage';

const drawerWidth = 280; // Set width of the left navigation

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: 'linear-gradient(135deg, #1976d2 0%, #2a5298 100%)',
  boxShadow: 'none',
  borderBottom: '1px solid #e0e0e0',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: 'linear-gradient(135deg, #1976d2 0%, #2a5298 100%)', // Blue gradient
    color: '#fff',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column', // To allow image and list to stack vertically
    alignItems: 'center', // Center image horizontally
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  color: '#fff',
}));

const AdminPanel: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState('generalInfo');
  const theme = useTheme();

  // Page rendering logic
  const renderPage = () => {
    switch (selectedPage) {
      case 'generalInfo':
        return <GeneralInfoPage />; // Default general information page
      case 'devices':
        return <DevicesPage />;
      case 'users':
        return <UsersPage />;
      case 'experiments':
        return <ExperimentsPage />;
      case 'archived':
        return <ArchivedPage />;
      default:
        return <GeneralInfoPage />; // Fallback to general info page
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Top AppBar */}
      <StyledAppBar position="fixed" sx={{
         width: `calc(100% - ${drawerWidth}px)`,
         ml: `${drawerWidth}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
            Brand Two 
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Left Navigation Drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
        }}
      >
        {/* Add the Image Here */}
        <Box
          component="img"
          src="/src/assets/images/logo_uj.png" // Update this to match your path
          alt="Brand Logo"
          sx={{
            width: '100%',
            marginBottom: theme.spacing(2), // Add some spacing below the image
          }}
        />
        
        <Box sx={{ overflow: 'auto', width: '100%' }}>
          <List>
             {/* General Info Page */}
             <ListItem 
              button 
              onClick={() => setSelectedPage('generalInfo')} 
              sx={{
                backgroundColor: selectedPage === 'generalInfo' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <Info sx={{ color: '#fff' }} />
              </ListItemIcon>
              <StyledListItemText primary="General Info" />
            </ListItem>
            <ListItem 
              button 
              onClick={() => setSelectedPage('devices')} 
              sx={{
                backgroundColor: selectedPage === 'devices' ? 'rgba(255, 255, 255, 0.2)' : 'transparent', // Highlight selected
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <Devices sx={{ color: '#fff' }} />
              </ListItemIcon>
              <StyledListItemText primary="Devices" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => setSelectedPage('users')} 
              sx={{
                backgroundColor: selectedPage === 'users' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <People sx={{ color: '#fff' }} />
              </ListItemIcon>
              <StyledListItemText primary="Users" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => setSelectedPage('experiments')} 
              sx={{
                backgroundColor: selectedPage === 'experiments' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <Science sx={{ color: '#fff' }} />
              </ListItemIcon>
              <StyledListItemText primary="Experiments" />
            </ListItem>

            <ListItem 
              button 
              onClick={() => setSelectedPage('archived')} 
              sx={{
                backgroundColor: selectedPage === 'archived' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <Archive sx={{ color: '#fff' }} />
              </ListItemIcon>
              <StyledListItemText primary="Archived" />
            </ListItem>
          </List>
        </Box>
      </StyledDrawer>

      {/* Right Content Area with Background */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f9fafc',
          p: 3,
          mt: '64px', // Offset for the AppBar height
          background: 'white', // Right side background gradient
          height: '-10', // Ensure it covers the full height
          width: '140vh'
        }}
      >
        {renderPage()}
      </Box>
    </Box>
  );
};

export default AdminPanel;
