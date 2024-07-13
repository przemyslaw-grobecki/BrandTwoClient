import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { Devices, People, Science, Archive, Menu as MenuIcon } from '@mui/icons-material';
import DevicesPage from '../DevicesPage';
import UsersPage from '../UsersPage';
import ExperimentsPage from '../ExperimentsPage';
import ArchivedPage from '../ArchivedPage';

const drawerWidth = 240;

const AdminPanel: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState('devices');
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, ...(drawerOpen && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
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
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          transition: 'margin-left 0.3s',
        }}
      >
        <Toolbar />
        {renderPage()}
      </Box>
    </Box>
  );
};

export default AdminPanel;
