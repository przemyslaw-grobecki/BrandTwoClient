import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  List,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Tooltip,
  ListItem,
  Checkbox,
} from '@mui/material';
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
import { IAuthorizedResourcesApi } from 'client/AuthorizedResources/IAuthorizedResourcesApi'; // Assume you have a Resources API
import { useTransition, animated } from '@react-spring/web';
import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { Device } from 'client/Devices/Device';

const RoleIcon = styled('span')<{ active: boolean; clickable?: boolean }>(({ theme, active, clickable }) => ({
  color: active ? theme.palette.primary.main : theme.palette.action.disabled,
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
  cursor: clickable ? 'pointer' : 'default',
}));

const ListItemStyled = styled(ListItem)<{ isEditing: boolean }>(({ theme, isEditing }) => ({
  transition: 'box-shadow 0.3s',
  boxShadow: isEditing ? `0 0 10px ${theme.palette.primary.main}` : 'none',
  opacity: 1,
  '&:hover': {
    boxShadow: isEditing ? `0 0 10px ${theme.palette.primary.main}` : 'none',
  },
  display: 'flex',
  alignItems: 'center',
}));

const UsersPage: React.FC = () => {
  const { client, brandClientTokenInfo } = useBrandClientContext();

  const usersApi: IUsersApi | undefined = useMemo(() => {
    if (brandClientTokenInfo != null) {
      return client.getUsersApi(brandClientTokenInfo);
    }
  }, [client, brandClientTokenInfo]);

  const rolesApi: IRolesApi | undefined = useMemo(() => {
    if (brandClientTokenInfo != null) {
      return client.getRolesApi(brandClientTokenInfo);
    }
  }, [client, brandClientTokenInfo]);

  const resourcesApi: IAuthorizedResourcesApi | undefined = useMemo(() => {
    if (brandClientTokenInfo != null) {
      return client.getAuthorizedResourcesApi(brandClientTokenInfo);
    }
  }, [client, brandClientTokenInfo]);

  const devicesApi: IDevicesApi | undefined = useMemo(() => {
    if (brandClientTokenInfo != null) {
      return client.getDevicesApi(brandClientTokenInfo);
    }
  }, [client, brandClientTokenInfo]);

  const [users, setUsers] = useState<UserModel[]>([]);
  const [devices, setDevices] = useState<Device[]>([]); // Store all devices here
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<{ [userId: string]: Role[] }>({});
  const [userResources, setUserResources] = useState<{ [userId: string]: string[] }>({});
  const [isEditingResources, setIsEditingResources] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (usersApi && rolesApi && resourcesApi && devicesApi) {
        const users: User[] = await usersApi.GetUsers();
        const devices: Device[] = await devicesApi.GetDevices(); // Fetch all devices once
        const userModels: UserModel[] = await Promise.all<UserModel>(
          users.map(async (user) => {
            const roles: Role[] = await rolesApi.GetUserRoles(user.id);
            const authorizedResourcesIds: string[] = await resourcesApi.GetAuthorizedResourcesForUser(user.id);
            return {
              id: user.id,
              userName: user.userName,
              email: user.email,
              roles: roles,
              authorizedResourcesIds: authorizedResourcesIds,
            };
          })
        );

        setUsers(userModels);
        setDevices(devices); // Set the available devices
        setUserRoles(
          userModels.reduce((acc, user) => {
            acc[user.id] = user.roles;
            return acc;
          }, {} as { [userId: string]: Role[] })
        );
        setUserResources(
          userModels.reduce((acc, user) => {
            acc[user.id] = user.authorizedResourcesIds;
            return acc;
          }, {} as { [userId: string]: string[] })
        );
      }
    };

    fetchData();
  }, [usersApi, rolesApi, resourcesApi, devicesApi]);

  const transitions = useTransition(users, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    keys: users.map((user) => user.id),
  });

  const handleChangeRoles = (userId: string) => {
    setEditingUserId(userId);
    setIsEditingResources(false); // Ensure not editing resources at the same time
  };

  const handleChangeResources = (userId: string) => {
    setEditingUserId(userId);
    setIsEditingResources(true); // Toggle to editing resources
  };

  const handleRoleToggle = (userId: string, role: Role) => {
    setUserRoles((prevRoles) => {
      const newRoles = [...(prevRoles[userId] || [])];
      if (newRoles.includes(role)) {
        return { ...prevRoles, [userId]: newRoles.filter((r) => r !== role) };
      } else {
        return { ...prevRoles, [userId]: [...newRoles, role] };
      }
    });
  };

  const handleResourceToggle = (userId: string, resource: string) => {
    setUserResources((prevResources) => {
      const newResources = [...(prevResources[userId] || [])];
      if (newResources.includes(resource)) {
        return { ...prevResources, [userId]: newResources.filter((r) => r !== resource) };
      } else {
        return { ...prevResources, [userId]: [...newResources, resource] };
      }
    });
  };

  const handleSaveChanges = async (userId: string) => {
    if (rolesApi && editingUserId && !isEditingResources) {
      const newRoles = await rolesApi.EditUserRoles(userId, userRoles[userId]);
      setEditingUserId(null);
      setUserRoles((prevRoles) => ({ ...prevRoles, [userId]: newRoles }));
    }
    if (resourcesApi && editingUserId && isEditingResources) {
      const newResources = await resourcesApi.SetAuthorizedResourcesForUser(userId, userResources[userId]);
      setEditingUserId(null);
      setUserResources((prevResources) => ({ ...prevResources, [userId]: newResources }));
    }
  };

  const roles: { role: Role; icon: any }[] = [
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
                      clickable={editingUserId === user.id && !isEditingResources}
                      onClick={() => editingUserId === user.id && !isEditingResources && handleRoleToggle(user.id, role)}
                    >
                      {icon}
                    </RoleIcon>
                  </Tooltip>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {editingUserId === user.id ? (
                  <Button variant="contained" color="primary" onClick={() => handleSaveChanges(user.id)}>
                    Save Changes
                  </Button>
                ) : (
                  <>
                    <IconButton onClick={() => handleChangeRoles(user.id)}>
                      <Button variant="outlined" color="primary">
                        Change Roles
                      </Button>
                    </IconButton>
                    <IconButton onClick={() => handleChangeResources(user.id)}>
                      <Button variant="outlined" color="primary">
                        Change Resource Permissions
                      </Button>
                    </IconButton>
                  </>
                )}
              </Box>
            </ListItemStyled>
            {editingUserId === user.id && isEditingResources && (
              <Box sx={{ pl: 4, pr: 4, pt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Edit Resource Permissions
                </Typography>
                {devices.map((device) => (
                  <Box key={device.deviceId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={userResources[user.id]?.includes(device.deviceId)}
                      onChange={() => handleResourceToggle(user.id, device.deviceId)}
                    />
                    <Typography>{device.occupiedComPort}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </animated.div>
        ))}
      </List>
    </div>
  );
};

export default UsersPage;
