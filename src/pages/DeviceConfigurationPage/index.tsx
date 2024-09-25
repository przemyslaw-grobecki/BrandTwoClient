import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Switch,
  Slider,
  TextField,
  MenuItem,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  CssBaseline,
  Tooltip,
  Divider,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useParams } from "react-router-dom";
import { useBrandClientContext } from "components/Providers/BrandClientContext";
import { IDevicesApi } from "client/Devices/IDevicesApi";
import { DeviceOption } from "client/Devices/DeviceOption";
import { DeviceConfigurableOptionType as DeviceOptionType } from "client/Devices/DeviceOptionType";
import { useTransition, animated } from "@react-spring/web";
import LoadingScreen from "pages/LoadingPage";
import { useTheme } from "@mui/material/styles";
import { DeviceCommand } from "client/Devices/DeviceCommand";
import { useAlert } from "components/Providers/AlertContext";

const DeviceConfiguration: React.FC = () => {
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const { deviceId } = useParams<{ deviceId: string }>();
  const [deviceConfigOptions, setDeviceConfigOptions] = useState<DeviceOption[]>([]);
  const [deviceCommands, setDeviceCommands] = useState<DeviceCommand[]>([]);
  const [tempConfigValues, setTempConfigValues] = useState<{ [key: string]: string }>({});
  const [changedConfigValues, setChangedConfigValues] = useState<{ [key: string]: string }>({});
  const [deviceType, setDeviceType] = useState<number>(99);
  const [editDeviceType, setEditDeviceType] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const theme = useTheme();

  const devicesApi: IDevicesApi | undefined = useMemo(() => {
    let devicesApi: IDevicesApi | undefined;
    if (brandClientTokenInfo != null) {
      devicesApi = client.getDevicesApi(brandClientTokenInfo);
    }
    return devicesApi;
  }, [client, brandClientTokenInfo]);

  useEffect(() => {
    fetchDeviceDetails();
  }, [devicesApi, deviceId]);

  useEffect(() => {
    if (deviceType !== 99) {
      fetchDeviceConfigOptions();
    }
  }, [devicesApi, deviceId, deviceType]);

  // Function to fetch device details
  const fetchDeviceDetails = async () => {
    if (devicesApi && deviceId) {
      try {
        const deviceDetails = await devicesApi.GetDevice(deviceId);
        setDeviceType(deviceDetails.type);
        setLoading(false);
      } catch (err) {
        setError("Failed to load device details.");
        setLoading(false);
      }
    }
  };

  // Function to fetch device configuration options and commands
  const fetchDeviceConfigOptions = async () => {
    if (devicesApi && deviceId && deviceType !== 99) {
      try {
        const options: DeviceOption[] = await devicesApi.GetDeviceOptions(deviceId);
        const commands: DeviceCommand[] = await devicesApi.GetDeviceCommands(deviceId);
        setDeviceConfigOptions(options);
        setDeviceCommands(commands);

        const initialValues = options.reduce((acc, option) => {
          acc[option.id] = getUnknownStateForOption(option.optionType, option.availableValues);
          return acc;
        }, {} as { [key: string]: string });
        setTempConfigValues(initialValues);
      } catch (err) {
        showAlert("Failed to load device configuration options.", "error");
        setError("Failed to load device configuration options.");
      }
    }
  };

  const getUnknownStateForOption = (optionType: number, availableValues: string) => {
    switch (optionType) {
      case DeviceOptionType.SWITCH:
        const switchValues = availableValues.split(";");
        return switchValues[0]; // Default to the first option in the switch

      case DeviceOptionType.RANGE:
        return "0"; // Default to minimum range value

      case DeviceOptionType.TEXT:
        return ""; // Default to empty text

      case DeviceOptionType.LIST:
        const listValues = availableValues.split(";");
        return listValues[0]; // Default to the first option in the list

      case DeviceOptionType.BINARY:
        const bitCount = Number(availableValues);
        return "0".repeat(bitCount); // Default to all zeroes

      case DeviceOptionType.READONLY:
        return "unknown"; // Default to 'unknown' for readonly options

      default:
        return "unknown"; // Fallback for unknown option types
    }
  };

  // Update tempConfigValues and track changes in changedConfigValues
  const handleOptionChange = (optionId: string, newValue: string) => {
    setTempConfigValues((prevValues) => ({
      ...prevValues,
      [optionId]: newValue,
    }));

    // Track only the changed values
    setChangedConfigValues((prevChangedValues) => ({
      ...prevChangedValues,
      [optionId]: newValue,
    }));
  };

  const handleSaveConfiguration = async () => {
    if (devicesApi != null && deviceId != null) {
      try {
        // Send only the changed options
        const updatedOptions: DeviceOption[] = await devicesApi.EditDeviceOptions(deviceId, changedConfigValues);

        // Update the deviceConfigOptions with the new values from the server
        setDeviceConfigOptions((prevOptions) => {
          // Merge updated options with existing ones
          return prevOptions.map((option) => {
            const updatedOption = updatedOptions.find((updated) => updated.id === option.id);
            return updatedOption ? { ...option, value: updatedOption.value } : option;
          });
        });

        // Clear the changed config values and temp config values after saving successfully
        setChangedConfigValues({});

        showAlert("Configuration successfully edited!", "success");
      } catch (error) {
        showAlert("Failure during options edit.", "error");
      }
    }
  };

  const handleDeviceTypeChange = async (newType: number) => {
    if (deviceId != null) {
      try {
        await devicesApi?.SetDeviceType(deviceId, newType);
        setDeviceType(newType);
        setEditDeviceType(false);
        showAlert("Device type successfully changed!", "success");
      } catch (err) {
        setError("Failed to update device type.");
      }
    }
  };

  const transitions = useTransition(deviceConfigOptions, {
    from: { opacity: 0, transform: "translateY(20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(20px)" },
    keys: deviceConfigOptions.map((option) => option.id),
  });

  // Handle button clicks for commands
  const handleCommandClick = async (command: DeviceCommand) => {
    if (devicesApi != null && deviceId != null) {
      try {
        await devicesApi.RunDeviceCommand(deviceId, command.id);
        showAlert(`Successfully executed command: ${command.name}.`, "success");
      } catch (error) {
        showAlert("Something went wrong during command execution. Try again later.", "error");
      }
    }
  };

  // Handle the refresh action
  const handleRefresh = async () => {
    if (devicesApi != null && deviceId != null) {
      try {
        const options = await devicesApi.RefreshDeviceOptions(deviceId);
        showAlert("Successfully refreshed device options.", "success");
        setDeviceConfigOptions(options);
      } catch (error) {
        showAlert("Failure during options refresh.", "error");
      }
    }
  };

  // Handle individual option refresh button click
  const handleOptionRefresh = (optionId: string) => {
    showAlert(`Option ${optionId} refreshed.`, "success");
  };

  const groupOptionsByGroup = (options: DeviceOption[]) => {
    return options.reduce((groups: { [key: string]: DeviceOption[] }, option) => {
      const group = option.group || "Ungrouped"; // Group by 'group' property or 'Ungrouped' if not defined
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {});
  };

  if (loading) return <LoadingScreen />;
  if (error) return <Typography color="error">{error}</Typography>;

  const groupedOptions = groupOptionsByGroup(deviceConfigOptions);

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          p: 0,
          minHeight: "100vh",
          width: "100vw",
          background: `url(/src/assets/images/login_background.jpg) no-repeat center center fixed`,
          backgroundSize: "cover",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "1200px",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            borderRadius: "10px",
            padding: "30px",
            margin: "0 auto",
            color: "black",
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: "#2a5298", fontWeight: "bold" }}>
            Configure Device: {deviceId}
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: "#2a5298" }}>
              Device Type
            </Typography>
            {editDeviceType ? (
              <TextField
                select
                fullWidth
                label="Device Type"
                value={deviceType}
                onChange={(e) => handleDeviceTypeChange(Number(e.target.value))}
                variant="outlined"
                sx={{ backgroundColor: "#fff", borderRadius: "5px" }}
              >
                <MenuItem value={0}>Brand Device</MenuItem>
                <MenuItem value={1}>Pressure Sensor</MenuItem>
                <MenuItem value={2}>Mock Device</MenuItem>
              </TextField>
            ) : (
              <Typography variant="body1">
                {deviceType === 0 && "Brand Device"}
                {deviceType === 1 && "Pressure Sensor"}
                {deviceType === 2 && "Mock Device"}
              </Typography>
            )}
            <Button
              variant="text"
              onClick={() => setEditDeviceType((prev) => !prev)}
              sx={{ mt: 1, color: theme.palette.primary.main }}
            >
              {editDeviceType ? "Cancel" : "Change Device Type"}
            </Button>
          </Box>
          {Object.entries(groupedOptions).map(([groupName, options]) => (
            <Box key={groupName} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ color: "#2a5298", fontWeight: "bold", mb: 2 }}>
                {groupName}
              </Typography>
              {transitions((style, option) => (
                <animated.div style={{ padding: '10px' }}>
                  <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '10px',
                    padding: '10px',
                    boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                    ':hover': {
                      boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                    },
                    position: 'relative'
                  }}
                >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ color: "#2a5298" }}
                      >
                        {option.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {option.description}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {renderConfigurableOption(
                        option,
                        tempConfigValues[option.id],
                        handleOptionChange
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOptionRefresh(option.id)}
                      color="primary"
                      sx={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </animated.div>
              ))}
            </Box>
          ))}
          {/* Render Command Buttons */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ color: "#2a5298" }}>
              Device Commands
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
              {deviceCommands.map((command) => (
                <Tooltip key={command.id} title={command.description}>
                  <Button
                    variant="contained"
                    onClick={() => handleCommandClick(command)}
                    sx={{ backgroundColor: "#2a5298", padding: "8px 16px" }}
                  >
                    {command.name}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </Box>
          <Divider sx={{ my: 4 }} />{" "}
          {/* Adds a horizontal line for separation */}
          {/* Add a Refresh Button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              sx={{
                padding: "8px 16px",
                color: "#2a5298",
                borderColor: "#2a5298",
              }}
              onClick={handleRefresh} // Trigger refresh
            >
              Refresh Configuration
            </Button>
            <Button
              variant="contained"
              sx={{ ml: 5, backgroundColor: "#2a5298", padding: "9px 20px" }}
              onClick={handleSaveConfiguration}
            >
              Save Configuration
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

// Function to render the configurable option UI based on the option type
const renderConfigurableOption = (
  option: DeviceOption,
  currentValue: string,
  onChange: (id: string, value: string) => void
) => {
  switch (option.optionType) {
    case DeviceOptionType.SWITCH:
      const switchValues = option.availableValues.split(";");
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
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

    case DeviceOptionType.RANGE:
      const [min, max, step] = option.availableValues.split(/[-\[\]]/).map(Number);
      const handleRangeChange = (value: string | number, fromInput = false) => {
        const numValue = Number(value);
        const clampedValue = Math.min(Math.max(numValue, min), max);
        onChange(option.id, clampedValue.toString());
        if (fromInput) {
          e.target.value = clampedValue.toString(); // Update input field with clamped value
        }
      };
      return (
        <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}>
          <TextField
            value={currentValue}
            type="number"
            onChange={(e) => handleRangeChange(e.target.value, true)}
            inputProps={{ min, max, step }}
            sx={{ width: "100px" }} // Increased width for 4-digit numbers
          />
          <Slider
            value={Number(currentValue)}
            min={min}
            max={max}
            step={step}
            onChange={(e, newValue) => handleRangeChange(newValue)}
            valueLabelDisplay="auto"
            sx={{ flexGrow: 1, marginRight: 6, marginLeft: 6 }} // Leave space before refresh button
          />
        </Box>
      );

    case DeviceOptionType.TEXT:
      return (
        <TextField
          fullWidth
          value={currentValue}
          onChange={(e) => onChange(option.id, e.target.value)}
          variant="outlined"
        />
      );

    case DeviceOptionType.LIST:
      const listValues = option.availableValues.split(";");
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

    case DeviceOptionType.BINARY:
      const bitCount = Number(option.availableValues);
      const binaryValue = currentValue.padStart(bitCount, "0").split("");

      return (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {binaryValue.map((bit, index) => (
            <ToggleButton
              key={index}
              selected={bit === "1"}
              value={bit}
              onClick={() => handleBinaryToggle(option.id, binaryValue, index, onChange)}
            >
              {bit}
            </ToggleButton>
          ))}
        </Box>
      );

    case DeviceOptionType.READONLY:
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
  const updatedBinaryValue = [...binaryValue]; // Create a copy of the binary array
  updatedBinaryValue[index] = updatedBinaryValue[index] === "0" ? "1" : "0"; // Toggle the specific bit
  const newBinaryValue = updatedBinaryValue.join(""); // Join the array back into a string
  onChange(optionId, newBinaryValue); // Call the onChange handler
};

export default DeviceConfiguration;
