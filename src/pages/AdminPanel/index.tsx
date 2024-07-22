import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Box, IconButton, Divider } from '@mui/material';
import { Devices, People, Science, Archive, Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import DevicesPage from '../DevicesPage';
import UsersPage from '../UsersPage';
import ExperimentsPage from '../ExperimentsPage';
import ArchivedPage from '../ArchivedPage';

const drawerWidth = 240;

const AdminPanel: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState('devices');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const theme = useTheme();

  const renderPage = () => {
    switch (selectedPage) {
      case 'devices':
        return <DevicesPage />;
      case 'users':
        return <UsersPage />;
      case 'experiments':
        return <ExperimentsPage />;
      case 'archived':
        return <ArchivedPage />;
      default:
        return <DevicesPage />;
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? drawerWidth : theme.spacing(7) + 1,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerOpen ? drawerWidth : theme.spacing(7) + 1, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => setSelectedPage('devices')}>
            <ListItemIcon><Devices /></ListItemIcon>
            <ListItemText primary="Devices" />
          </ListItem>
          <ListItem button onClick={() => setSelectedPage('users')}>
            <ListItemIcon><People /></ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button onClick={() => setSelectedPage('experiments')}>
            <ListItemIcon><Science /></ListItemIcon>
            <ListItemText primary="Experiments" />
          </ListItem>
          <ListItem button onClick={() => setSelectedPage('archived')}>
            <ListItemIcon><Archive /></ListItemIcon>
            <ListItemText primary="Archived" />
          </ListItem>
        </List>
      </Drawer>
      <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'absolute', 
            top: '50vh', 
            left: drawerOpen ? `${drawerWidth-50}px` : `${theme.spacing(7) + 1}px`,
            transform: 'translateY(-50%)',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
              boxShadow: 'none',
            },
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          transition: 'margin-right 3.3s',
          marginLeft: drawerOpen ? `${0}px` : `${theme.spacing(7) + 1}px`,
        }}
      >
        <Toolbar />
        {renderPage()}
      </Box>
    </Box>
  );
};

export default AdminPanel;
