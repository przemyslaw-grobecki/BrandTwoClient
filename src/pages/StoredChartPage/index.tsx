import React, { useEffect, useMemo, useState } from "react";
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
  Grid,
  useTheme,
  CssBaseline,
  Collapse,
  IconButton,
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
import { useBrandClientContext } from "components/Providers/BrandClientContext";
import { IAcquisitonApi } from "client/Acquisition/IAcquisitionApi";
import { StorageItem } from "client/Acquisition/StorageItem";
import { useLocation } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Przykładowa struktura danych z API
interface DataPoint {
  timestamp: string;
  value: number;
}

interface DeviceData {
  deviceId: string;
  dataPoints: DataPoint[];
}

const StoredChartPage: React.FC<{ experimentId: string }> = ({
  experimentId,
}) => {
  const location = useLocation();
  const { client, brandClientTokenInfo } = useBrandClientContext();

  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTables, setExpandedTables] = useState<{
    [key: string]: boolean;
  }>({});
  const [deviceIds, setDeviceIds] = useState<string[]>([]);

  const theme = useTheme();

  const acquisitionApi: IAcquisitonApi | undefined = useMemo(() => {
    if (brandClientTokenInfo != null) {
      return client.getAcquisitionApi(brandClientTokenInfo);
    }
  }, [brandClientTokenInfo]);

  const getQueryParams = (search: string) => {
    return new URLSearchParams(search);
  };

  // Funkcja pobierająca dane z API (statyczne dane dla urządzeń)
  const fetchData = async () => {
    try {
      if (acquisitionApi != null) {
        var data: DeviceData[] = [];

        for (const deviceId of deviceIds) {
          const storageItems: StorageItem[] =
            await acquisitionApi.GetStoredDataForSession(
              experimentId + "_" + deviceId
            );
          data.push({
            deviceId: deviceId,
            dataPoints: storageItems.map((s) => ({
              timestamp: s.timestamp,
              value: parseInt(s.value),
            })),
          });
        }

        setDeviceData(data); // Ustaw dane urządzeń w stanie
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Zakończ ładowanie
    }
  };

  useEffect(() => {
    const queryParams = getQueryParams(location.search);
    const deviceIdsParam = queryParams.get("deviceIds");
    if (deviceIdsParam) {
      const splittedIds = deviceIdsParam.includes(",")
        ? deviceIdsParam.split(",")
        : [deviceIdsParam];
      setDeviceIds(splittedIds);
    }
  }, [experimentId, location.search]);

  useEffect(() => {
    fetchData(); // Pobierz dane na załadowanie strony
  }, [deviceIds]);

  const handleToggleExpand = (deviceId: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  if (loading) {
    return <Typography>Loading data...</Typography>; // Ekran ładowania
  }

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          p: 0,
          minHeight: "100vh",
          width: "100vw", // Full-width for the background
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
          <Typography variant="h4" gutterBottom>
            Stored Data for Experiment: {experimentId}
          </Typography>

          {/* Renderowanie wykresów dla każdego urządzenia */}
          {deviceData.map((device) => (
            <Box key={device.deviceId} sx={{ mb: 5 }}>
              <Typography variant="h5" gutterBottom>
                Device ID: {device.deviceId}
              </Typography>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={device.dataPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
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

              <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                  Data Table for Device: {device.deviceId}
                </Typography>
                <IconButton onClick={() => handleToggleExpand(device.deviceId)}>
                  {expandedTables[device.deviceId] ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>
              <Collapse
                in={expandedTables[device.deviceId]}
                timeout="auto"
                unmountOnExit
              >
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {device.dataPoints.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.timestamp}</TableCell>
                          <TableCell align="right">{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default StoredChartPage;
