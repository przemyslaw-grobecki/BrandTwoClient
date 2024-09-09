import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { gateway } from 'development-settings.json';

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

const RealTimeChartPage: React.FC<{ deviceIds: string[] }> = ({ deviceIds }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [chartScale, setChartScale] = useState<'linear' | 'log'>('linear');
  const [lowerBound, setLowerBound] = useState<number | null>(null);
  const [upperBound, setUpperBound] = useState<number | null>(null);

  const MAX_DISPLAY_POINTS = 50; // Number of points to display without shifting the chart
  const MAX_TABLE_ROWS = 1000; // Maximum number of rows in the table

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${gateway}/signalr-endpoint`, {
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Connected to SignalR');
          connection.on('ReceiveData', (notificationData: NotificationData) => {
            const [receivedDeviceId, dataPurpose] = notificationData.topic.split('#');
            const newDataPoint = {
              timestamp: notificationData.timestamp,
              value: parseFloat(notificationData.serializedContent.split(' ')[1].trim()),
            };

            if (deviceIds.includes(receivedDeviceId) && dataPurpose === 'data') {
              setDeviceData((prevDeviceData) => {
                const updatedDeviceData = prevDeviceData.map((device) => {
                  if (device.deviceId === receivedDeviceId) {
                    const updatedDataPoints = [...device.dataPoints, newDataPoint];
                    const updatedTableData = [...device.tableData, newDataPoint];

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

                // If no data exists for this device, add it
                if (!updatedDeviceData.find((device) => device.deviceId === receivedDeviceId)) {
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
        .catch((error) => console.log('Connection failed: ', error));

      return () => {
        connection.stop();
      };
    }
  }, [connection, deviceIds]);

  const handleToggleScale = () => {
    setChartScale((prevScale) => (prevScale === 'linear' ? 'log' : 'linear'));
  };

  const handleLowerBoundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setLowerBound(value);
  };

  const handleUpperBoundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setUpperBound(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Real-Time Experiment Data
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button variant="contained" onClick={handleToggleScale}>
            Toggle Y-Axis Scale (Current: {chartScale})
          </Button>
        </Grid>
        <Grid item>
          <TextField
            label="Lower Bound"
            type="number"
            value={lowerBound !== null ? lowerBound : ''}
            onChange={handleLowerBoundChange}
            inputProps={{ step: 'any' }}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Upper Bound"
            type="number"
            value={upperBound !== null ? upperBound : ''}
            onChange={handleUpperBoundChange}
            inputProps={{ step: 'any' }}
          />
        </Grid>
      </Grid>

      {/* Render charts for each device */}
      {deviceData.map((device) => (
        <Box key={device.deviceId} sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom>
            Device ID: {device.deviceId}
          </Typography>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={device.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis
                scale={chartScale}
                domain={[
                  lowerBound !== null ? lowerBound : 'auto',
                  upperBound !== null ? upperBound : 'auto',
                ]}
                allowDataOverflow={chartScale === 'log'}
                tickFormatter={(tick) => (chartScale === 'log' && tick <= 0 ? '' : tick)}
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

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
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
  );
};

export default RealTimeChartPage;
