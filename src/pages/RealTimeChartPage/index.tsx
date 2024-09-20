import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Grid,
  CssBaseline,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import { gateway } from "development-settings.json";
import { useTheme } from "@mui/material/styles";

interface NotificationData {
  topic: string;
  serializedContent: string;
  timestamp: string;
}

interface DataPoint {
  timestamp: string;
  value: number;
}

interface DeviceData {
  deviceId: string;
  dataPoints: DataPoint[];
  tableData: DataPoint[];
}

const RealTimeChartPage: React.FC<{ experimentId: string }> = ({
  experimentId,
}) => {
  const location = useLocation();
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [chartScale, setChartScale] = useState<"linear" | "log">("linear");
  const [lowerBound, setLowerBound] = useState<number | null>(null);
  const [upperBound, setUpperBound] = useState<number | null>(null);
  const theme = useTheme();

  const MAX_DISPLAY_POINTS = 50;
  const MAX_TABLE_ROWS = 1000;

  const getQueryParams = (search: string) => {
    return new URLSearchParams(search);
  };

  useEffect(() => {
    const queryParams = getQueryParams(location.search);
    const deviceIdsParam = queryParams.get("deviceIds");

    if (deviceIdsParam) {
      setDeviceIds(deviceIdsParam.split(","));
    }
  }, [location.search]);

  useEffect(() => {
    if (deviceIds.length > 0) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${gateway}/signalr-endpoint?experimentId=${experimentId}`, {
          withCredentials: false,
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    }
  }, [experimentId, deviceIds]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR");
          connection.on("ReceiveData", (notificationData: NotificationData) => {
            const [receivedDeviceId, dataPurpose] =
              notificationData.topic.split("#");
            const newDataPoint = {
              timestamp: notificationData.timestamp,
              value: parseFloat(notificationData.serializedContent),
            };

            if (
              deviceIds.includes(receivedDeviceId) &&
              dataPurpose === "data"
            ) {
              setDeviceData((prevDeviceData) => {
                const updatedDeviceData = prevDeviceData.map((device) => {
                  if (device.deviceId === receivedDeviceId) {
                    const updatedDataPoints = [
                      ...device.dataPoints,
                      newDataPoint,
                    ];
                    const updatedTableData = [
                      ...device.tableData,
                      newDataPoint,
                    ];

                    return {
                      ...device,
                      dataPoints:
                        updatedDataPoints.length > MAX_DISPLAY_POINTS
                          ? updatedDataPoints.slice(-MAX_DISPLAY_POINTS)
                          : updatedDataPoints,
                      tableData:
                        updatedTableData.length > MAX_TABLE_ROWS
                          ? updatedTableData.slice(-MAX_TABLE_ROWS)
                          : updatedTableData,
                    };
                  }
                  return device;
                });

                if (
                  !updatedDeviceData.find(
                    (device) => device.deviceId === receivedDeviceId
                  )
                ) {
                  updatedDeviceData.push({
                    deviceId: receivedDeviceId,
                    dataPoints: [newDataPoint],
                    tableData: [newDataPoint],
                  });
                }

                return updatedDeviceData;
              });
            }
          });
        })
        .catch((error) => console.log("Connection failed: ", error));

      return () => {
        connection.stop();
      };
    }
  }, [connection, deviceIds]);

  const handleToggleScale = () => {
    setChartScale((prevScale) => (prevScale === "linear" ? "log" : "linear"));
  };

  const handleLowerBoundChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    setLowerBound(value);
  };

  const handleUpperBoundChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value);
    setUpperBound(value);
  };

  // Function to format timestamp to HH:mm:ss.SSS
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

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
            Real-Time Experiment Data for Experiment: {experimentId}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleToggleScale}
                sx={{ backgroundColor: "#2a5298", padding: "9px 20px" }}
              >
                Toggle Y-Axis Scale (Current: {chartScale})
              </Button>
            </Grid>
            <Grid item>
              <TextField
                label="Lower Bound"
                type="number"
                value={lowerBound !== null ? lowerBound : ""}
                onChange={handleLowerBoundChange}
                inputProps={{ step: "any" }}
                variant="outlined"
                sx={{ backgroundColor: "#fff", borderRadius: "5px" }}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Upper Bound"
                type="number"
                value={upperBound !== null ? upperBound : ""}
                onChange={handleUpperBoundChange}
                inputProps={{ step: "any" }}
                variant="outlined"
                sx={{ backgroundColor: "#fff", borderRadius: "5px" }}
              />
            </Grid>
          </Grid>

          {deviceData.map((device) => (
            <Box
              key={device.deviceId}
              sx={{
                mb: 5,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                ":hover": {
                  boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                },
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ color: "#2a5298" }}>
                Device ID: {device.deviceId}
              </Typography>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={device.dataPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime} // Apply the custom formatter here
                  />
                  <YAxis
                    scale={chartScale}
                    domain={[
                      lowerBound !== null ? lowerBound : "auto",
                      upperBound !== null ? upperBound : "auto",
                    ]}
                    allowDataOverflow={chartScale === "log"}
                    tickFormatter={(tick) =>
                      chartScale === "log" && tick <= 0 ? "" : tick
                    }
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    isAnimationActive={false}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              <Typography
                variant="h6"
                gutterBottom
                sx={{ mt: 3, color: "#2a5298" }}
              >
                Data Table for Device: {device.deviceId}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {device.tableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.timestamp}</TableCell>
                        <TableCell align="right">{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default RealTimeChartPage;
