import React, { useEffect, useMemo, useState } from 'react';
import { Button, List, ListItem, ListItemText, ListItemIcon, IconButton, Typography, Box, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { styled } from '@mui/system';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IUsersApi } from 'client/Identity/IUsersApi';
import { IRolesApi } from 'client/Identity/IRolesApi';
import { UserModel } from './UserModel';
import { User } from 'client/Identity/User';
import { Role } from 'client/Identity/Role';

const RoleIcon = styled('span')<{ active: boolean; clickable?: boolean }>(({ theme, active, clickable }) => ({
  color: active ? theme.palette.primary.main : theme.palette.action.disabled,
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
  cursor: clickable ? 'pointer' : 'default',
}));

const UserItem = styled(ListItem)<{ editing: boolean; grayedOut: boolean }>(({ theme, editing, grayedOut }) => ({
  opacity: grayedOut ? 0.5 : 1,
  pointerEvents: grayedOut ? 'none' : 'auto',
  boxShadow: editing ? `0 0 10px 2px ${theme.palette.primary.main}` : 'none',
  transition: 'opacity 0.3s, box-shadow 0.3s',
  backgroundColor: editing ? theme.palette.action.hover : 'transparent',
}));

const UsersPage: React.FC = () => {
  const { client, brandClientTokenInfo } = useBrandClientContext();
  
  const usersApi: IUsersApi | undefined = useMemo(() => {
    let usersApi: IUsersApi | undefined;
    if (brandClientTokenInfo != null) {
      usersApi = client.getUsersApi(brandClientTokenInfo);
    }
    return usersApi;
  }, [client, brandClientTokenInfo]);

  const rolesApi: IRolesApi | undefined = useMemo(() => {
    let rolesApi: IRolesApi | undefined;
    if (brandClientTokenInfo != null) {
      rolesApi = client.getRolesApi(brandClientTokenInfo);
    }
    return rolesApi;
  }, [client, brandClientTokenInfo]);

  const [users, setUsers] = useState<UserModel[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ [userId: string]: Role[] }>({});

  useEffect(() => {
    const fetchUsersWithRoles = async () => {
      if(usersApi != null && rolesApi != null){
        const users: User[] = await usersApi.GetUsers();
        const userModels: UserModel[] = await Promise.all<UserModel>(users.map(async user => {
          const roles: Role[] = await rolesApi.GetUserRoles(user.id);
          return {
            id: user.id,
            userName: user.userName,
            email: user.email,
            roles: roles
          }
        }));
        setUsers(userModels);
        setUserRoles(
          userModels.reduce((acc, user) => {
            acc[user.id] = user.roles;
            return acc;
          }, {} as { [userId: string]: Role[] })
        );
      }
    }

    fetchUsersWithRoles();
  }, [usersApi, rolesApi]);

  const handleChangeRoles = (userId: string) => {
    setEditingUserId(userId);
  };

  const handleRoleToggle = (userId: string, role: Role) => {
    setUserRoles((prevRoles) => {
      const newRoles = [...(prevRoles[userId] || [])];
      if (newRoles.includes(role)) {
        // Remove role
        return { ...prevRoles, [userId]: newRoles.filter(r => r !== role) };
      } else {
        // Add role
        return { ...prevRoles, [userId]: [...newRoles, role] };
      }
    });
  };

  const handleSaveChanges = async (userId: string) => {
    if (rolesApi && editingUserId) {
      const newRoles = await rolesApi.EditUserRoles(userId, userRoles[userId]);
      setEditingUserId(null);

      // Optionally, refetch roles for verification
      setUserRoles((prevRoles) => ({ ...prevRoles, [userId]: newRoles }));
    }
  };

  const roles: { role: Role, icon: any }[] = [
    { role: 'Spectator', icon: <VisibilityIcon /> },
    { role: 'Maintainer', icon: <BuildIcon /> },
    { role: 'Performer', icon: <PlayCircleFilledIcon /> },
    { role: 'Administrator', icon: <AdminPanelSettingsIcon /> },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>
      <List>
        {users.map((user) => (
          <UserItem
            key={user.id}
            editing={editingUserId === user.id}
            grayedOut={editingUserId !== null && editingUserId !== user.id}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={user.userName} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {roles.map(({ role, icon }) => (
                <Tooltip key={role} title={role}>
                  <RoleIcon
                    active={userRoles[user.id]?.includes(role)}
                    clickable={editingUserId === user.id}
                    onClick={() => editingUserId === user.id && handleRoleToggle(user.id, role)}
                  >
                    {icon}
                  </RoleIcon>
                </Tooltip>
              ))}
            </Box>
            {editingUserId === user.id ? (
              <Button variant="contained" color="primary" onClick={() => handleSaveChanges(user.id)}>
                Save Changes
              </Button>
            ) : (
              <IconButton onClick={() => handleChangeRoles(user.id)}>
                <Button variant="outlined" color="primary">
                  Change Roles
                </Button>
              </IconButton>
            )}
          </UserItem>
        ))}
      </List>
    </div>
  );
};

export default UsersPage;
