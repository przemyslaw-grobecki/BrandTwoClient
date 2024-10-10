import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  ButtonBase,
  Card,
  CardContent,
  CardMedia,
  Grid,
  styled,
  Typography,
  useTheme,
  Box,
  Fab,
  Zoom,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import { Settings as SettingsIcon, Science as ScienceIcon, Refresh as RefreshIcon, Edit as EditIcon, Check as CheckIcon } from '@mui/icons-material';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { Device } from 'client/Devices/Device';
import { IAuthorizedResourcesApi } from 'client/AuthorizedResources/IAuthorizedResourcesApi';
import { IExperimentsApi } from 'client/Experiments/IExperimentsApi';
import { IAcquisitonApi } from 'client/Acquisition/IAcquisitionApi';
import { useTrail, animated } from '@react-spring/web';
import { deviceTypeToString } from 'client/Devices/DeviceTypeToString';
import { AcquisitionConfiguration } from 'client/Acquisition/AcquisitionConfiguration';
import { useAlert } from 'components/Providers/AlertContext';
import { Experiment } from 'client/Experiments/Experiment';

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
  border: "1px solid #e0e0e0", // Add border
  height: maxHeight,
  width: maxWidth,
}));

const DevicesPage: React.FC = () => {
  const theme = useTheme();
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const { showAlert } = useAlert();

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
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<string | null>(null);
  const [renamingDeviceId, setRenamingDeviceId] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState<string>('');

  const cardRefs = useRef<HTMLDivElement[]>([]);

  // Hardcoded device
  const hardcodedDevice: Device = {
    deviceId: '------------',
    name: 'Brand Acquisition',
    occupiedComPort: 'none',
    type: 7,
  };

  const fetchDevices = async () => {
    if (devicesApi != null) {
      try {
        const devices = await devicesApi.GetDevices();
        setDevices([hardcodedDevice, ...devices]);
      } catch (error) {
        showAlert('Could not fetch devices from server.', 'error');
      }
    }
  };

  useEffect(() => {
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
        try {
          const configs = await acquisitionApi.GetAcquisitionConfigurations();
          setAcquisitionConfigurations(configs);
        } catch (error) {
          showAlert('Could not fetch acquisition configurations.', 'error');
        }
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

  const handleRenameDevice = async (deviceId: string) => {
    if (devicesApi && newDeviceName.trim() !== '') {
      try {
        const updatedDevice = await devicesApi.RenameDevice(deviceId, newDeviceName);
        setDevices((prevDevices) =>
          prevDevices.map((device) =>
            device.deviceId === deviceId ? { ...device, name: updatedDevice.name } : device
          )
        );
        showAlert('Device name successfully updated!', 'success');
        setRenamingDeviceId(null);
      } catch (error) {
        showAlert('Failed to rename device.', 'error');
      }
    }
  };

  const handleConfigureDevice = () => {
    if (selectedDevices.size === 1) {
      const deviceId = Array.from(selectedDevices)[0];
      window.open(deviceId === '------------' ? `/acquisition-configuration/Brand Acquisition` : `/device-configuration/${deviceId}`, '_blank');
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
      try {
        var response: Experiment = await experimentsApi.CreateExperiment(
          Array.from(selectedDevices),
          storeData ? 'storage' : 'freefall',
          selectedConfigurationId // Pass selected acquisition configuration ID
        );
        showAlert(`Created new experiment with id: ${response.id}`, 'success');
      } catch (error) {
        showAlert('Could not create new experiment.', 'error');
      }
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

  // Function to get image based on device type
  const getImageForDeviceType = (type: number, id: string) => {
    switch (type) {
      case 7:
        return '/src/assets/images/acquisition.jpg';
      case 0:
        return '/src/assets/images/sum_img.jpg';
      case 1:
        return '/src/assets/images/vacuum_meter.jpg'; // Replace with the correct path
      case 2:
        return '/src/assets/images/mock_device.png';
      case 3:
        return '/src/assets/images/vacuum.jpg'
      default:
        return `https://picsum.photos/seed/${id}/400/600`; // Default image
    }
  };

  return (
    <div>
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
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {renamingDeviceId === devices[index].deviceId ? (
                            <TextField
                              variant="outlined"
                              value={newDeviceName}
                              onChange={(e) => setNewDeviceName(e.target.value)}
                              size="small"
                              sx={{ marginRight: 1 }}
                            />
                          ) : (
                            <Typography variant="h6" component="div">
                              {devices[index].name}
                            </Typography>
                          )}
                          {renamingDeviceId === devices[index].deviceId ? (
                            <IconButton onClick={(e) => { e.stopPropagation(); handleRenameDevice(devices[index].deviceId); }} size="small">
                              <CheckIcon />
                            </IconButton>
                          ) : (
                            <IconButton onClick={(e) => { e.stopPropagation(); setRenamingDeviceId(devices[index].deviceId); setNewDeviceName(devices[index].name); }} size="small">
                              <EditIcon />
                            </IconButton>
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {devices[index].deviceId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Occupied Com Port: {devices[index].occupiedComPort}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Device Type: {deviceTypeToString(devices[index].type)}
                        </Typography>
                      </CardContent>
                      <CardMedia
                        component="img"
                        alt="Device Image"
                        height="140"
                        image={getImageForDeviceType(devices[index].type, devices[index].deviceId)} // Use the function to get image
                      />
                    </GlowCard>
                  </Box>
                </Tooltip>
              </ButtonBase>
            </animated.div>
          </Grid>
        ))}
      </Grid>

      {/* Floating Action Buttons, starting with Refresh */}
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
        {/* Configure Device Button (visible only if 1 device selected) */}
        <Zoom in={selectedDevices.size === 1}>
          <Fab color="secondary" aria-label="configure" onClick={handleConfigureDevice}>
            <SettingsIcon />
          </Fab>
        </Zoom>
        {/* Create Experiment Button (visible only if 1 or more devices selected) */}
        <Zoom in={selectedDevices.size > 0}>
          <Fab color="secondary" aria-label="create experiment" onClick={handleCreateExperiment}>
            <ScienceIcon />
          </Fab>
        </Zoom>
        {/* Always visible Refresh button */}
        <Zoom in={true}>
          <Fab color="primary" aria-label="refresh" onClick={fetchDevices}>
            <RefreshIcon />
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
            value={selectedConfigurationId || ''}
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
            variant={storeData ? 'contained' : 'outlined'}
            onClick={() => setStoreData(true)}
            sx={{ mt: 2, mr: 2 }}
          >
            Store Data
          </Button>
          <Button
            variant={!storeData ? 'contained' : 'outlined'}
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
