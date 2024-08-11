import React, { useEffect, useMemo, useState } from 'react';
import { Button, List, ListItem, ListItemText, ListItemIcon, IconButton, Typography, Box, Tooltip } from '@mui/material';
import { isEqual, sortBy } from 'lodash';
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

const RoleIcon = styled('span')<{ active: boolean }>(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.action.disabled,
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
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

  const [userBeingChanged, setUserBeingChanged] = useState<UserModel | undefined>(undefined);
  const [users, setUsers] = useState<UserModel[]>([]);

  useEffect(() => {
    // const mockUsers: User[] = [
    //   { id: '1', name: 'Alice Johnson', roles: ['Spectator', 'Admin'] },
    //   { id: '2', name: 'Bob Smith', roles: ['Maintainer'] },
    //   { id: '3', name: 'Charlie Brown', roles: ['Performer', 'Spectator'] },
    //   { id: '4', name: 'Diana Prince', roles: ['Admin', 'Performer', 'Maintainer'] },
    //   { id: '5', name: 'Eve Black', roles: [] }, // No roles
    // ];
    
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
      }
    }

    fetchUsersWithRoles();
  }, []);

  const handleChangeRoles = async (userId: string) => {
    const theUser : UserModel | undefined = users.find(user => user.id == userId);
    if(theUser == undefined){
      return;
    } 
    if (userBeingChanged == undefined) {
      setUserBeingChanged(theUser);
    }
    else {
      if(!isEqual(userBeingChanged.roles, theUser!.roles))
      {
        const editedRoles = await rolesApi!.EditUserRoles(userId, userBeingChanged.roles);
        theUser!.roles = editedRoles;
        setUsers(prevUsers => [
          ...prevUsers.filter(user => user.id != userId),
          theUser
        ]);
      }
      setUserBeingChanged(undefined);
    }
  };

  const roles: { role: Role, icon: any }[] = [
    { role: 'Spectator', icon: <VisibilityIcon /> },
    { role: 'Maintainer', icon: <BuildIcon /> },
    { role: 'Performer', icon: <PlayCircleFilledIcon /> },
    { role: 'Administrator', icon: <AdminPanelSettingsIcon /> },
  ];

  function handleRoleToggle(role: Role): void {
    setUserBeingChanged(prevUser => {
      if (prevUser?.roles.includes(role)) {
        return {
          ...prevUser,
          roles: prevUser.roles.filter(r => r != role)
        }
      } else {
        const newRoles : Role[] | undefined = prevUser?.roles;
        if(newRoles != undefined){ 
          newRoles.push(role);
        }
        return {
          ...prevUser,
          roles: newRoles
        }
      }
    });
  }

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
            <ListItemText primary={user.userName} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {roles.map(({ role, icon }) => (
                <Tooltip key={role} title={role}>
                  <RoleIcon active={user.roles.includes(role)}
                   clickable={userBeingChanged?.id === user.id}
                   onClick={() => userBeingChanged?.id === user.id && handleRoleToggle(role)}
                  >
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
