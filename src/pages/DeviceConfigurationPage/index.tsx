import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Switch,
  Slider,
  TextField,
  MenuItem,
  Button,
  ToggleButton,
  CssBaseline,
  Tooltip,
  Divider,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useParams } from "react-router-dom";
import { useBrandClientContext } from "components/Providers/BrandClientContext";
import { IDevicesApi } from "client/Devices/IDevicesApi";
import { DeviceOption } from "client/Devices/DeviceOption";
import { DeviceConfigurableOptionType as DeviceOptionType } from "client/Devices/DeviceOptionType";
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
  const [activeTab, setActiveTab] = useState(0); // State for active group tab
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue); // Update active group tab
  };

  const handleSliderChange = useCallback((optionId: string, newValue: string) => {
    setTempConfigValues((prevValues) => ({
      ...prevValues,
      [optionId]: newValue,
    }));
  }, []);

  const handleSliderCommit = useCallback((optionId: string, newValue: string) => {
    setChangedConfigValues((prevChangedValues) => ({
      ...prevChangedValues,
      [optionId]: newValue,
    }));
  }, []);

  const handleOptionChange = useCallback((optionId: string, newValue: string) => {
    setTempConfigValues((prevValues) => ({
      ...prevValues,
      [optionId]: newValue,
    }));

    setChangedConfigValues((prevChangedValues) => ({
      ...prevChangedValues,
      [optionId]: newValue,
    }));
  }, []);

  const handleSaveConfiguration = async () => {
    if (devicesApi != null && deviceId != null) {
      try {
        const updatedOptions: DeviceOption[] = await devicesApi.EditDeviceOptions(deviceId, changedConfigValues);

        setDeviceConfigOptions((prevOptions) => {
          return prevOptions.map((option) => {
            const updatedOption = updatedOptions.find((updated) => updated.id === option.id);
            return updatedOption ? { ...option, value: updatedOption.value } : option;
          });
        });

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
  const groupNames = Object.keys(groupedOptions);

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
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#2a5298", fontWeight: "bold" }}
          >
            Configure Device: {deviceId}
          </Typography>

          {/* Tabs to switch between groups */}
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            {groupNames.map((groupName, index) => (
              <Tab key={groupName} label={groupName} />
            ))}
          </Tabs>

          {/* Only render the options of the active group */}
          {groupNames.map((groupName, index) =>
            index === activeTab ? (
              <Box key={groupName} sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "#2a5298", fontWeight: "bold", mb: 2 }}
                >
                  {groupName}
                </Typography>

                {groupedOptions[groupName].map((option) => (
                  <Box
                    key={option.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      position: "relative",
                    }}
                  >
                    {/* Left Section: Name and Description (Vertical Layout) */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ color: "#2a5298" }}
                      >
                        {option.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {option.description}
                      </Typography>
                    </Box>

                    {/* Right Section: Memoized Option, Button, and Conditional Icon */}
                    <Box sx={{ flex: 2, display: "flex", alignItems: "center", marginLeft: "auto", gap: 2 }}>
                      <MemoizedOption
                        key={option.id}
                        option={option}
                        currentValue={tempConfigValues[option.id]}
                        handleChange={handleOptionChange}
                        handleSliderChange={handleSliderChange}
                        handleSliderCommit={handleSliderCommit}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleOptionRefresh(option.id)}
                        color="primary"
                        sx={{ marginLeft: "auto" }}
                      >
                        <RefreshIcon />
                      </IconButton>

                      {/* Conditional Rendering of Icons based on the option's value */}
                      {option.value.toLowerCase() === "unknown" && (
                        <Tooltip title="Option is undefined">
                          <WarningIcon sx={{ color: "orange" }} />
                        </Tooltip>
                      )}
                      {option.value.toLowerCase() === "error" && (
                        <Tooltip title="Option is in fault state">
                          <ErrorIcon sx={{ color: "red" }} />
                        </Tooltip>
                      )}
                      {option.value &&
                        option.value.toLowerCase() !== "unknown" &&
                        option.value.toLowerCase() !== "error" && (
                        <Tooltip title="Option is correctly synced">
                          <CheckCircleIcon sx={{ color: "green" }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : null
          )}

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
          <Divider sx={{ my: 4 }} />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              sx={{
                padding: "8px 16px",
                color: "#2a5298",
                borderColor: "#2a5298",
              }}
              onClick={handleRefresh}
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

// Memoized rendering of individual configurable options
const MemoizedOption = React.memo(
  ({
    option,
    currentValue,
    handleChange,
    handleSliderChange,
    handleSliderCommit,
  }) => {
    return renderConfigurableOption(
      option,
      currentValue,
      handleChange,
      handleSliderChange,
      handleSliderCommit
    );
  }
);

// Function to render the configurable option UI based on the option type
const renderConfigurableOption = (
  option: DeviceOption,
  currentValue: string,
  onChange: (id: string, value: string) => void,
  handleSliderChange: (id: string, value: string) => void,
  handleSliderCommit: (id: string, value: string) => void
) => {
  const isErrorOrUndefined =
    currentValue === "Undefined" || currentValue === "ERROR";

  switch (option.optionType) {
    case DeviceOptionType.SWITCH:
      const switchValues = option.availableValues.split(";");
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Typography
            sx={isErrorOrUndefined ? { color: "red", fontWeight: "bold" } : {}}
          >
            {switchValues[0]}
          </Typography>
          <Switch
            checked={currentValue === switchValues[1]}
            onChange={(e) =>
              onChange(
                option.id,
                e.target.checked ? switchValues[1] : switchValues[0]
              )
            }
          />
          <Typography
            sx={isErrorOrUndefined ? { color: "red", fontWeight: "bold" } : {}}
          >
            {switchValues[1]}
          </Typography>
        </Box>
      );

    case DeviceOptionType.RANGE:
      const [min, max, step] = option.availableValues
        .split(/[-\[\]]/)
        .map(Number);
      return (
        <Box
          sx={{ display: "flex", alignItems: "center", width: "100%", gap: 5 }}
        >
          <TextField
            value={currentValue}
            error={isErrorOrUndefined}
            helperText={isErrorOrUndefined && currentValue}
            type="number"
            onChange={(e) => handleSliderChange(option.id, e.target.value)}
            onBlur={(e) => handleSliderCommit(option.id, e.target.value)} // Persist onBlur
            sx={{ width: "100px" }} // Add padding to the left
          />
          <Slider
            value={Number(currentValue)}
            min={min}
            max={max}
            step={step}
            onChange={(e, newValue) =>
              handleSliderChange(option.id, newValue.toString())
            }
            onChangeCommitted={(e, newValue) =>
              handleSliderCommit(option.id, newValue.toString())
            } // Persist on slider commit
            sx={isErrorOrUndefined ? { borderColor: "red", borderWidth: 2 } : {}}
            valueLabelDisplay="auto"
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
              onClick={() =>
                handleBinaryToggle(option.id, binaryValue, index, onChange)
              }
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
