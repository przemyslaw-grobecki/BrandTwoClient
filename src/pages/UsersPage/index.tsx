import React, { useEffect, useMemo, useState } from 'react';
import { Button, List, ListItemText, ListItemIcon, IconButton, Typography, Box, Tooltip, ListItem } from '@mui/material';
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
import { useTransition, animated } from '@react-spring/web';

const RoleIcon = styled('span')<{ active: boolean; clickable?: boolean }>(({ theme, active, clickable }) => ({
  color: active ? theme.palette.primary.main : theme.palette.action.disabled,
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
  cursor: clickable ? 'pointer' : 'default',
}));

const ListItemStyled = styled(ListItem)<{ isEditing: boolean }>(({ theme, isEditing }) => ({
  transition: 'box-shadow 0.3s',
  boxShadow: isEditing ? `0 0 10px ${theme.palette.primary.main}` : 'none',
  opacity: 1, // Ensure items are fully opaque by default
  '&:hover': {
    boxShadow: isEditing ? `0 0 10px ${theme.palette.primary.main}` : 'none',
  },
  display: 'flex', // Ensure flex layout
  alignItems: 'center', // Center items vertically
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

  const transitions = useTransition(users, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    keys: users.map((user) => user.id),
  });

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
        {transitions((style, user) => (
          <animated.div style={style}>
            <ListItemStyled isEditing={editingUserId === user.id}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary={user.userName} sx={{ flex: '1 1 auto' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, flex: '1 1 auto' }}>
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
              <IconButton onClick={() => handleChangeRoles(user.id)}>
                {editingUserId === user.id ? (
                  <Button variant="contained" color="primary" onClick={() => handleSaveChanges(user.id)}>
                    Save Changes
                  </Button>
                ) : (
                  <Button variant="outlined" color="primary">
                    Change Roles
                  </Button>
                )}
              </IconButton>
            </ListItemStyled>
          </animated.div>
        ))}
      </List>
    </div>
  );
};

export default UsersPage;
