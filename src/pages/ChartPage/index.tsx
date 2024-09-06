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
  Grid
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
  const [lowerBound, setLowerBound] = useState<number | null>(null);
  const [upperBound, setUpperBound] = useState<number | null>(null);

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
              value: parseFloat(deserializedObject.serializedContent.split(' ')[1].trim())
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
        Real-Time Experiment Data - {experimentId}
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

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dataPoints}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" /> {/* X-axis remains linear for timestamps */}
          <YAxis
            scale={chartScale}
            domain={[
              lowerBound !== null ? lowerBound : 'auto',
              upperBound !== null ? upperBound : 'auto'
            ]}
            allowDataOverflow={chartScale === 'log'} 
            tickFormatter={(tick) =>
              chartScale === 'log' && tick <= 0 ? '' : tick
            } // Handle zero and negative values in log scale
          />
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

      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
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
