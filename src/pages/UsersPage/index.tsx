import React, { useEffect, useState } from 'react';
import { Button, List, ListItem, ListItemText, ListItemIcon, IconButton, Typography, Box, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { styled } from '@mui/system';

interface User {
  id: string;
  name: string;
  roles: string[];
}

const RoleIcon = styled('span')<{ active: boolean }>(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.action.disabled,
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
}));

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const mockUsers: User[] = [
      { id: '1', name: 'Alice Johnson', roles: ['Spectator', 'Admin'] },
      { id: '2', name: 'Bob Smith', roles: ['Maintainer'] },
      { id: '3', name: 'Charlie Brown', roles: ['Performer', 'Spectator'] },
      { id: '4', name: 'Diana Prince', roles: ['Admin', 'Performer', 'Maintainer'] },
      { id: '5', name: 'Eve Black', roles: [] }, // No roles
    ];

    setUsers(mockUsers);
  }, []);

  const handleChangeRoles = (userId: string) => {
    // Logic for changing roles, possibly opening a modal or dropdown to select roles
    alert(`Change roles for user ID: ${userId}`);
  };

  const roles = [
    { role: 'Spectator', icon: <VisibilityIcon /> },
    { role: 'Maintainer', icon: <BuildIcon /> },
    { role: 'Performer', icon: <PlayCircleFilledIcon /> },
    { role: 'Admin', icon: <AdminPanelSettingsIcon /> },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={user.name} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {roles.map(({ role, icon }) => (
                <Tooltip key={role} title={role}>
                  <RoleIcon active={user.roles.includes(role)}>
                    {icon}
                  </RoleIcon>
                </Tooltip>
              ))}
            </Box>
            <IconButton onClick={() => handleChangeRoles(user.id)}>
              <Button variant="outlined" color="primary">
                Change Roles
              </Button>
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default UsersPage;
