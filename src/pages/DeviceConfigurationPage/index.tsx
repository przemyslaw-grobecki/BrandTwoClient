import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Switch, Slider, TextField, MenuItem, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { DeviceOption } from 'client/Devices/DeviceOption';
import { DeviceConfigurableOptionType } from 'client/Devices/DeviceOptionType';
import { useTransition, animated } from '@react-spring/web';
import LoadingScreen from 'pages/LoadingPage';

const DeviceConfiguration: React.FC = () => {
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const { deviceId } = useParams<{ deviceId: string }>();
  const [deviceConfigOptions, setDeviceConfigOptions] = useState<DeviceOption[]>([]);
  const [tempConfigValues, setTempConfigValues] = useState<{ [key: string]: string }>({});
  const [deviceType, setDeviceType] = useState<number>(99); // Initial state for unknown device type
  const [editDeviceType, setEditDeviceType] = useState<boolean>(false); // Toggle to edit device type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const devicesApi: IDevicesApi | undefined = useMemo(() => {
    let devicesApi: IDevicesApi | undefined;
    if (brandClientTokenInfo != null) {
      devicesApi = client.getDevicesApi(brandClientTokenInfo);
    }
    return devicesApi;
  }, [client, brandClientTokenInfo]);

  useEffect(() => {
    const fetchDeviceDetails = async () => {
      if (devicesApi && deviceId) {
        try {
          const deviceDetails = await devicesApi.GetDevice(deviceId);
          setDeviceType(deviceDetails.type); // Assume deviceType is part of device details
          setLoading(false);
        } catch (err) {
          setError('Failed to load device details.');
          setLoading(false);
        }
      }
    };

    fetchDeviceDetails();
  }, [devicesApi, deviceId]);

  useEffect(() => {
    const fetchDeviceConfigOptions = async () => {
      if (devicesApi && deviceId && deviceType !== 99) {
        try {
          const options = await devicesApi.GetDeviceOptions(deviceId);
          setDeviceConfigOptions(options);

          const initialValues = options.reduce((acc, option) => {
            acc[option.id] = option.value;
            return acc;
          }, {} as { [key: string]: string });
          setTempConfigValues(initialValues);
        } catch (err) {
          setError('Failed to load device configuration options.');
        }
      }
    };

    if (deviceType !== 99) {
      fetchDeviceConfigOptions();
    }
  }, [devicesApi, deviceId, deviceType]);

  const handleOptionChange = (optionId: string, newValue: string) => {
    setTempConfigValues((prevValues) => ({
      ...prevValues,
      [optionId]: newValue,
    }));
  };

  const handleSaveConfiguration = () => {
    console.log('Saving configuration:', tempConfigValues);
    alert('Device configuration saved!');
  };

  const handleDeviceTypeChange = async (newType: number) => {
    if (deviceId != null) {
      try {
        await devicesApi?.SetDeviceType(deviceId, newType); // Call API to update device type
        setDeviceType(newType);
        setEditDeviceType(false); // Disable editing after save
      } catch (err) {
        setError('Failed to update device type.');
      }
    }
  };

  const transitions = useTransition(deviceConfigOptions, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    keys: deviceConfigOptions.map((option) => option.id),
  });

  if (loading) return <LoadingScreen />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configure Device: {deviceId}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Device Type</Typography>
        {editDeviceType ? (
          <TextField
            select
            fullWidth
            label="Device Type"
            value={deviceType}
            onChange={(e) => handleDeviceTypeChange(Number(e.target.value))}
            variant="outlined"
          >
            <MenuItem value={0}>Brand Device</MenuItem>
            <MenuItem value={1}>Pressure Sensor</MenuItem>
            <MenuItem value={2}>Mock Device</MenuItem>
            {/* Add more device types as needed */}
          </TextField>
        ) : (
          <Typography variant="body1">
            {deviceType === 0 && "Brand Device"}
            {deviceType === 1 && "Pressure Sensor"}
            {deviceType === 2 && "Mock Device"}
            {/* Add more cases for other device types */}
          </Typography>
        )}
        <Button
          variant="text"
          onClick={() => setEditDeviceType((prev) => !prev)} // Toggle between edit mode and display mode
          sx={{ mt: 1 }}
        >
          {editDeviceType ? "Cancel" : "Change Device Type"}
        </Button>
      </Box>

      {transitions((style, option) => (
        <animated.div style={style} key={option.id}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {option.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {option.description}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              {renderConfigurableOption(option, tempConfigValues[option.id], handleOptionChange)}
            </Box>
          </Box>
        </animated.div>
      ))}

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSaveConfiguration}>
          Save Configuration
        </Button>
      </Box>
    </Box>
  );
};

const renderConfigurableOption = (
  option: DeviceOption,
  currentValue: string,
  onChange: (id: string, value: string) => void
) => {
  switch (option.optionType) {
    case DeviceConfigurableOptionType.SWITCH:
      const switchValues = option.availableValues.split(';');
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography>{switchValues[0]}</Typography>
          <Switch
            checked={currentValue === switchValues[1]}
            onChange={(e) =>
              onChange(option.id, e.target.checked ? switchValues[1] : switchValues[0])
            }
          />
          <Typography>{switchValues[1]}</Typography>
        </Box>
      );
    case DeviceConfigurableOptionType.RANGE:
      const [min, max, step] = option.availableValues.split(/[-\[\]]/).map(Number);
      return (
        <Slider
          value={Number(currentValue)}
          min={min}
          max={max}
          step={step}
          onChange={(e, newValue) => onChange(option.id, newValue.toString())}
          valueLabelDisplay="auto"
          sx={{ width: '100%' }}
        />
      );
    case DeviceConfigurableOptionType.TEXT:
      return (
        <TextField
          fullWidth
          value={currentValue}
          onChange={(e) => onChange(option.id, e.target.value)}
          variant="outlined"
        />
      );
    case DeviceConfigurableOptionType.LIST:
      const listValues = option.availableValues.split(';');
      return (
        <TextField
          select
          fullWidth
          value={currentValue}
          onChange={(e) => onChange(option.id, e.target.value)}
          variant="outlined"
        >
          {listValues.map((val) => (
            <MenuItem key={val} value={val}>
              {val}
            </MenuItem>
          ))}
        </TextField>
      );
    case DeviceConfigurableOptionType.BINARY:
      const bitCount = Number(option.availableValues);
      const binaryValue = currentValue.padStart(bitCount, '0').split('');
      return (
        <ToggleButtonGroup
          value={binaryValue.join('')}
          onChange={(e, newValue) => onChange(option.id, newValue)}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          {binaryValue.map((bit, index) => (
            <ToggleButton
              key={index}
              value={bit === '0' ? '1' : '0'}
              onClick={() => handleBinaryToggle(option.id, binaryValue, index, onChange)}
            >
              {bit}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      );
    case DeviceConfigurableOptionType.READONLY:
      return (
        <TextField
          fullWidth
          value={currentValue}
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
        />
      );
    default:
      return <Typography variant="body2">Unsupported option type.</Typography>;
  }
};

const handleBinaryToggle = (
  optionId: string,
  binaryValue: string[],
  index: number,
  onChange: (id: string, value: string) => void
) => {
  binaryValue[index] = binaryValue[index] === '0' ? '1' : '0';
  const newBinaryValue = binaryValue.join('');
  onChange(optionId, newBinaryValue);
};

export default DeviceConfiguration;
