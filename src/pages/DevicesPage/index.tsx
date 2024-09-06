import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ButtonBase, Card, CardContent, CardMedia, Grid, styled, Typography, useTheme, Box, Fab, Zoom, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField, MenuItem } from '@mui/material';
import { Settings as SettingsIcon, Science as ScienceIcon } from '@mui/icons-material';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { Device } from 'client/Devices/Device';
import { IAuthorizedResourcesApi } from 'client/AuthorizedResources/IAuthorizedResourcesApi';
import { IExperimentsApi } from 'client/Experiments/IExperimentsApi';
import { IAcquisitonApi } from 'client/Acquisition/IAcquisitionApi';
import { useTrail, animated } from '@react-spring/web';
import { deviceTypeToString } from 'client/Devices/DeviceTypeToString';

const GlowCard = styled(Card)(({ theme, selected, special, maxHeight, maxWidth, error }: { theme: any; selected: boolean; special?: boolean; maxHeight: number; maxWidth: number; error: boolean }) => ({
  // same GlowCard styles
}));

const DevicesPage: React.FC = () => {
  const theme = useTheme();
  const { client, brandClientTokenInfo } = useBrandClientContext();
  
  const devicesApi: IDevicesApi | undefined = useMemo(() => {
    return client && brandClientTokenInfo ? client.getDevicesApi(brandClientTokenInfo) : undefined;
  }, [client, brandClientTokenInfo]);

  const authorizedResourcesApi: IAuthorizedResourcesApi | undefined = useMemo(() => {
    return client && brandClientTokenInfo ? client.getAuthorizedResourcesApi(brandClientTokenInfo) : undefined;
  }, [client, brandClientTokenInfo]);

  const experimentsApi: IExperimentsApi | undefined = useMemo(() => {
    return client && brandClientTokenInfo ? client.getExperimentsApi(brandClientTokenInfo) : undefined;
  }, [client, brandClientTokenInfo]);

  const acquisitionApi: IAcquisitonApi | undefined = useMemo(() => {
    return client && brandClientTokenInfo ? client.getAcquisitionApi(brandClientTokenInfo) : undefined;
  }, [client, brandClientTokenInfo]);

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [storeData, setStoreData] = useState(false);
  const [acquisitionConfigurations, setAcquisitionConfigurations] = useState<AcquisitionConfiguration[]>([]);
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<string | null>(null); // Added for storing selected acquisition configuration

  const cardRefs = useRef<HTMLDivElement[]>([]);

  // Hardcoded device
  const hardcodedDevice: Device = {
    deviceId: 'Brand Acquisition',
    occupiedComPort: '',
    type: 7,
  };

  useEffect(() => {
    const fetchDevices = async () => {
      if (devicesApi != null) {
        let devices = await devicesApi.GetDevices();
        setDevices([hardcodedDevice, ...devices]);
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

  useEffect(() => {
    const fetchConfigurations = async () => {
      if (acquisitionApi) {
        const configs = await acquisitionApi.GetAcquisitionConfigurations();
        setAcquisitionConfigurations(configs);
      }
    };
    fetchConfigurations();
  }, [acquisitionApi]);

  const isUserAuthorizedToResource = async (resourceId: string): Promise<boolean> => {
    if (authorizedResourcesApi != null) {
      const response = await authorizedResourcesApi.HasAccess(resourceId);
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
      setTimeout(() => setAccessDenied(null), 1000);
    }
  };

  const handleConfigureDevice = () => {
    if (selectedDevices.size === 1) {
      const deviceId = Array.from(selectedDevices)[0];
      window.open(deviceId === 'Brand Acquisition' ? `/acquisition-configuration/${deviceId}` : `/device-configuration/${deviceId}`, '_blank');
    }
  };

  const handleCreateExperiment = () => {
    if (selectedDevices.size > 0) {
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = async (confirmed: boolean) => {
    setIsDialogOpen(false);

    if (confirmed && experimentsApi != null && selectedConfigurationId) {
      alert('Creating an experiment with selected devices');
      await experimentsApi.CreateExperiment(
        Array.from(selectedDevices),
        storeData ? 'storage' : 'freefall',
        selectedConfigurationId // Pass selected acquisition configuration ID
      );
    }
  };

  const handleConfigurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedConfigurationId(event.target.value);
  };

  // Animation for devices
  const trail = useTrail(devices.length, {
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 },
  });

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Devices
      </Typography>
      <Grid container spacing={3}>
        {trail.map((animation, index) => (
          <Grid item xs={12} sm={6} md={4} key={devices[index].deviceId}>
            <animated.div style={{ ...animation, padding: theme.spacing(1) }}>
              <ButtonBase onClick={() => handleCardClick(devices[index].deviceId)} sx={{ width: '100%' }}>
                <Tooltip
                  title="Access denied"
                  open={accessDenied === devices[index].deviceId}
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
                      selected={selectedDevices.has(devices[index].deviceId)}
                      theme={theme}
                      special={devices[index].deviceId === 'Brand Acquisition'}
                      maxHeight={maxHeight ?? 'auto'}
                      maxWidth={maxWidth ?? 'auto'}
                      error={accessDenied === devices[index].deviceId}
                    >
                      <CardMedia
                        component="img"
                        alt="Device Image"
                        height="140"
                        image={`https://picsum.photos/seed/${devices[index].deviceId}/400/600`}
                      />
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {devices[index].deviceId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Occupied Com Port: {devices[index].occupiedComPort}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Device Type: {deviceTypeToString(devices[index].type)}
                        </Typography>
                      </CardContent>
                    </GlowCard>
                  </Box>
                </Tooltip>
              </ButtonBase>
            </animated.div>
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
          zIndex: 4,
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

      {/* Experiment Creation Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => handleDialogClose(false)}
      >
        <DialogTitle>Confirm Experiment Creation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select an acquisition configuration for the experiment.
          </DialogContentText>
          <TextField
            select
            fullWidth
            label="Acquisition Configuration"
            value={selectedConfigurationId || ""}
            onChange={handleConfigurationChange}
            variant="outlined"
            margin="normal"
          >
            {acquisitionConfigurations.map((config) => (
              <MenuItem key={config.id} value={config.id}>
                {config.name}
              </MenuItem>
            ))}
          </TextField>
          <DialogContentText>
            Do you want to store the data from the selected devices during the experiment?
          </DialogContentText>
          <Button
            variant={storeData ? "contained" : "outlined"}
            onClick={() => setStoreData(true)}
            sx={{ mt: 2, mr: 2 }}
          >
            Store Data
          </Button>
          <Button
            variant={!storeData ? "contained" : "outlined"}
            onClick={() => setStoreData(false)}
            sx={{ mt: 2 }}
          >
            Do Not Store Data
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary" disabled={!selectedConfigurationId}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DevicesPage;
