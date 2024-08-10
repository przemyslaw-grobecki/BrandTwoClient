import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ButtonBase, Card, CardContent, CardMedia, Grid, styled, Typography, useTheme, Box, Fab, Zoom, Tooltip } from '@mui/material';
import { Settings as SettingsIcon, Science as ScienceIcon } from '@mui/icons-material';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { Device } from 'client/Devices/Device';
import { IAuthorizedResourcesApi } from 'client/AuthorizedResources/IAuthorizedResourcesApi';

const GlowCard = styled(Card)(({ theme, selected, special, maxHeight, maxWidth, error }: { theme: any; selected: boolean; special?: boolean; maxHeight: number; maxWidth: number; error: boolean }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s, top 0.3s, box-shadow 1s',
  transform: error 
    ? 'rotate(-5deg)' // Add a tilt when there's an error
    : selected 
    ? 'scale(1.05)' 
    : 'scale(1)',
  boxShadow: error
    ? `0 0 30px ${theme.palette.error.main}` // Red glow for error
    : selected
    ? special
      ? `0 0 30px ${theme.palette.success.main}` // Green glow for special device
      : `0 0 30px ${theme.palette.primary.main}`
    : 'none',
  position: 'relative',
  top: selected ? '-10px' : '0', // Move selected cards higher
  zIndex: selected ? 2 : 1, // Ensure selected cards are on top
  '&:hover': {
    transform: error
      ? 'rotate(-5deg)' // Ensure tilt and red glow remain during hover in error state
      : 'scale(1.05)',
    boxShadow: error
      ? `0 0 30px ${theme.palette.error.main}` // Ensure red glow remains during hover in error state
      : special 
        ? `0 0 30px ${theme.palette.success.main}` // Green glow for special device
        : `0 0 30px ${theme.palette.primary.main}`,
    zIndex: 3, // Ensure hovered card is on top, but below selected cards
  },
  '&:active': {
    transform: error 
      ? 'rotate(-5deg)' // Ensure tilt remains on active during error state
      : 'scale(1.05)',
    boxShadow: error 
      ? `0 0 30px ${theme.palette.error.main}` // Ensure red glow remains on active during error state
      : special 
        ? `0 0 30px ${theme.palette.success.main}` // Green glow for special device
        : `0 0 30px ${theme.palette.primary.main}`,
  },
  height: maxHeight,
  width: maxWidth,
}));


const DevicesPage: React.FC = () => {
  const theme = useTheme();
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const devicesApi: IDevicesApi | undefined = useMemo(() => {
    let devicesApi: IDevicesApi | undefined;
    if (brandClientTokenInfo != null) {
      devicesApi = client.getDevicesApi(brandClientTokenInfo);
    }
    return devicesApi;
  }, [client, brandClientTokenInfo]);
  
  const authorizedResourcesApi: IAuthorizedResourcesApi | undefined = useMemo(() => {
    let authorizedResourcesApi: IAuthorizedResourcesApi | undefined;
    if (brandClientTokenInfo != null) {
      authorizedResourcesApi = client.getAuthorizedResourcesApi(brandClientTokenInfo);
    }
    return authorizedResourcesApi;
  }, [client, brandClientTokenInfo]);

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState<string | null>(null); // Track access denied card
  const cardRefs = useRef<HTMLDivElement[]>([]);

  // Hardcoded device
  const hardcodedDevice: Device = {
    deviceId: 'Brand Acquisition',
    occupiedComPort: 'COM7',
    connectionType: 'Ethernet',
  };

  useEffect(() => {
    const fetchDevices = async () => {
      if (devicesApi != null) {
        let devices = await devicesApi.GetDevices();
        setDevices([hardcodedDevice, ...devices]); // Add the hardcoded device to the list
      }
    };
    fetchDevices();
  }, [devicesApi]);

  useEffect(() => {
    if (cardRefs.current.length > 0) {
      const heights = cardRefs.current.map((ref) => ref.offsetHeight);
      const widths = cardRefs.current.map((ref) => ref.offsetWidth);
      setMaxHeight(Math.max(...heights));
      setMaxWidth(Math.max(...widths));
    }
  }, [devices]);

  const isUserAuthorizedToResource = async (resourceId: string): Promise<boolean> => {
    if(authorizedResourcesApi != null){
      var response = await authorizedResourcesApi.HasAccess(resourceId);
      return response.isAuthorized;
    }
    return false;
  };

  const handleCardClick = async (id: string) => {
    const accessGranted = await isUserAuthorizedToResource(id);
    if (accessGranted) {
      setSelectedDevices((prevSelectedDevices) => {
        const newSelectedDevices = new Set(prevSelectedDevices);
        if (newSelectedDevices.has(id)) {
          newSelectedDevices.delete(id);
        } else {
          newSelectedDevices.add(id);
        }
        return newSelectedDevices;
      });
    } else {
      setAccessDenied(id);
      setTimeout(() => setAccessDenied(null), 1000); // Reset access denied state after 1 second
    }
  };

  const handleConfigureDevice = () => {
    if (selectedDevices.size === 1) {
      const deviceId = Array.from(selectedDevices)[0];
      alert(`Configuring device: ${deviceId}`);
      // Add configuration logic here
    }
  };

  const handleCreateExperiment = () => {
    if (selectedDevices.size > 0) {
      alert('Creating an experiment with selected devices');
      // Add experiment creation logic here
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Devices
      </Typography>
      <Grid container spacing={3}>
        {devices.map((device, index) => (
          <Grid item xs={12} sm={6} md={4} key={device.deviceId}>
            <ButtonBase onClick={() => handleCardClick(device.deviceId)} sx={{ width: '100%' }}>
              <Tooltip
                title="Access denied"
                open={accessDenied === device.deviceId}
                placement="top"
                arrow
              >
                <Box
                  ref={(el) => (cardRefs.current[index] = el!)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <GlowCard
                    selected={selectedDevices.has(device.deviceId)}
                    theme={theme}
                    special={device.deviceId === 'Brand Acquisition'} // Apply special styling to hardcoded device
                    maxHeight={maxHeight ?? 'auto'}
                    maxWidth={maxWidth ?? 'auto'}
                    error={accessDenied === device.deviceId} // Apply error styling if access is denied
                  >
                    <CardMedia
                      component="img"
                      alt="Device Image"
                      height="140"
                      image={`https://picsum.photos/seed/${device.deviceId}/400/600`} // Random image
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {device.deviceId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Occupied Com Port: {device.occupiedComPort}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Connection Type: {device.connectionType}
                      </Typography>
                    </CardContent>
                  </GlowCard>
                </Box>
              </Tooltip>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 4, // Ensure FABs are on top of other elements
        }}
      >
        <Zoom in={selectedDevices.size === 1}>
          <Fab color="primary" aria-label="configure" onClick={handleConfigureDevice}>
            <SettingsIcon />
          </Fab>
        </Zoom>
        <Zoom in={selectedDevices.size > 0}>
          <Fab color="secondary" aria-label="create experiment" onClick={handleCreateExperiment}>
            <ScienceIcon />
          </Fab>
        </Zoom>
      </Box>
    </div>
  );
};

export default DevicesPage;
