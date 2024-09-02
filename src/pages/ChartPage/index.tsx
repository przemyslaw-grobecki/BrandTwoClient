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
  Button
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { gateway } from 'development-settings.json';

interface NotificationData {
  serializedContent: string;
  timestamp: string;
}

const RealTimeChartPage: React.FC<{ experimentId: string }> = ({ experimentId }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [dataPoints, setDataPoints] = useState<{ timestamp: string; value: number }[]>([]);
  const [tableData, setTableData] = useState<{ timestamp: string; value: number }[]>([]);
  const [chartScale, setChartScale] = useState<'linear' | 'log'>('linear');

  const MAX_DISPLAY_POINTS = 50; // Number of points to display without shifting the chart
  const MAX_TABLE_ROWS = 1000; // Maximum number of rows in the table

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${gateway}/signalr-endpoint?experimentId=${experimentId}`, {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [experimentId]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Connected to SignalR');
          connection.on('ReceiveData', (notificationData: any) => {
            const deserializedObject: NotificationData = notificationData;
            const newDataPoint = {
              timestamp: deserializedObject.timestamp,
              value: parseInt(deserializedObject.serializedContent)
            };

            setDataPoints((prev) => {
              const updatedData = [...prev, newDataPoint];
              if (updatedData.length > MAX_DISPLAY_POINTS) {
                return updatedData.slice(-MAX_DISPLAY_POINTS);
              }
              return updatedData;
            });

            setTableData((prev) => {
              const updatedTableData = [...prev, newDataPoint];
              if (updatedTableData.length > MAX_TABLE_ROWS) {
                return updatedTableData.slice(-MAX_TABLE_ROWS);
              }
              return updatedTableData;
            });
          });
        })
        .catch((error) => console.log('Connection failed: ', error));

      return () => {
        connection.stop();
      };
    }
  }, [connection]);

  const handleToggleScale = () => {
    setChartScale((prevScale) => (prevScale === 'linear' ? 'log' : 'linear'));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Real-Time Experiment Data - {experimentId}
      </Typography>

      <Box sx={{ mb: 3, height: 400 }}>
        <Button variant="contained" onClick={handleToggleScale} sx={{ mb: 2 }}>
          Toggle Y-Axis Scale (Current: {chartScale})
        </Button>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataPoints}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis scale={chartScale} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              isAnimationActive={false}
              dot={false} // No dots for individual points to keep the line smooth
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Typography variant="h5" gutterBottom>
        Data Table
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
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.timestamp}</TableCell>
                <TableCell align="right">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RealTimeChartPage;
