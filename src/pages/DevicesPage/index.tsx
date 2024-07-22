import React, { useEffect, useMemo, useState } from 'react';
import { ButtonBase, Card, CardContent, CardMedia, Grid, styled, Typography, useTheme } from '@mui/material';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { Device } from 'client/Devices/Device';

const GlowCard = styled(Card)(({ theme, selected }: { theme: any; selected: boolean }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  transform: selected ? 'scale(1.05)' : 'scale(1)',
  boxShadow: selected ? `0 0 30px ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 30px ${theme.palette.primary.main}`,
  },
  '&:active': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 30px ${theme.palette.primary.main}`,
  },
}));

const DevicesPage: React.FC = () => {
  const theme = useTheme();
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const devicesApi: IDevicesApi | undefined = useMemo(() => {
    let devicesApi: IDevicesApi | undefined;
    if(brandClientTokenInfo != null){
      devicesApi = client.getDevicesApi(brandClientTokenInfo);
    }
    return devicesApi;
  }, [client, brandClientTokenInfo]);

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDevices = async () => {
      if(devicesApi != null){
        let devices = await devicesApi.GetDevices();
        setDevices(devices);
      }
    };
    fetchDevices();
  }, []);

  const handleCardClick = (id: string) => {
    setSelectedDevices((prevSelectedDevices) => {
      const newSelectedDevices = new Set(prevSelectedDevices);
      if (newSelectedDevices.has(id)) {
        newSelectedDevices.delete(id);
      } else {
        newSelectedDevices.add(id);
      }
      return newSelectedDevices;
    });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Devices
      </Typography>
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} sm={6} md={4} key={device.deviceId}>
            <ButtonBase onClick={() => handleCardClick(device.deviceId)}>
              <GlowCard selected={selectedDevices.has(device.deviceId)} theme={theme}>
                <CardMedia
                  component="img"
                  alt="Device Image"
                  height="140"
                  image={`https://picsum.photos/seed/${device.deviceId}/400/600`} // Random image
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    Device ID: {device.deviceId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Occupied Com Port: {device.occupiedComPort}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connection Type: {device.connectionType}
                  </Typography>
                </CardContent>
              </GlowCard>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

//`https://picsum.photos/seed/${device.id}/200/300`

export default DevicesPage;
