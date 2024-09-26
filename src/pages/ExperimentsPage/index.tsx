import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  ButtonBase,
  Card,
  CardContent,
  CardMedia, // Add CardMedia for the image
  Grid,
  styled,
  Typography,
  useTheme,
  Box,
  Fab,
  Zoom,
  IconButton,
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Visibility as LiveViewIcon,
  BarChart as ChartsIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useBrandClientContext } from "components/Providers/BrandClientContext";
import { IExperimentsApi } from "client/Experiments/IExperimentsApi";
import { Experiment } from "client/Experiments/Experiment";
import { useTrail, animated } from "@react-spring/web";
import { useAlert } from "components/Providers/AlertContext";
import StatusIndicator from "components/StatusIndicatorComponent"; // Import the StatusIndicator component
import { IAcquisitonApi } from "client/Acquisition/IAcquisitionApi";

const GlowCard = styled(Card)(
  ({ theme, selected }: { theme: any; selected: boolean }) => ({
    transition: "transform 0.3s, box-shadow 0.3s, top 0.3s",
    transform: selected ? "scale(1.05)" : "scale(1)",
    border: "1px solid #e0e0e0", // Add border
    boxShadow: selected
      ? `0px 10px 30px rgba(0, 0, 0, 0.1), 0 0 30px ${theme.palette.primary.main}` // Glow effect + shadow
      : "0px 5px 15px rgba(0, 0, 0, 0.05)", // Default shadow
    position: "relative",
    top: selected ? "-10px" : "0", // Move selected cards higher
    zIndex: selected ? 2 : 1, // Ensure selected cards are on top
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.1), 0 0 30px ${theme.palette.primary.main}`, // Glow effect + stronger shadow on hover
      zIndex: 3, // Ensure hovered card is on top, but below selected cards
    },
  })
);

const getStatus = (experiment: Experiment) => {
  if (experiment.endedAt != null) {
    return "Ended";
  }
  if (experiment.startedAt != null) {
    return "Started";
  }
  if (experiment.createdAt != null) {
    return "Created";
  }
  return "Unknown"; // Fallback status
};

const ExperimentsPage: React.FC = () => {
  const theme = useTheme();
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const { showAlert } = useAlert();
  const experimentsApi: IExperimentsApi | undefined = useMemo(() => {
    let experimentsApi: IExperimentsApi | undefined;
    if (brandClientTokenInfo != null) {
      experimentsApi = client.getExperimentsApi(brandClientTokenInfo);
    }
    return experimentsApi;
  }, [client, brandClientTokenInfo]);

  const acquisitionApi: IAcquisitonApi | undefined = useMemo(() => {
    let acquisitionApi: IAcquisitonApi | undefined;
    if(brandClientTokenInfo != null) {
        acquisitionApi = client.getAcquisitionApi(brandClientTokenInfo);
    }
    return acquisitionApi;
  }, [client, brandClientTokenInfo]);

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  const fetchExperiments = async () => {
    try {
      if (experimentsApi != null) {
        const fetchedExperiments = await experimentsApi.GetRelevantExperiments();
        setExperiments(fetchedExperiments);
      }
    } catch (error) {
      showAlert("Could not fetch active experiments. Try again later.", "error");
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, [experimentsApi]);

  const handleCardClick = (id: string) => {
    setSelectedExperiment(id);
  };

  const handleStartExperiment = async () => {
    if (selectedExperiment && experimentsApi) {
      try {
        const updatedExperiment = await experimentsApi.StartExperiment(selectedExperiment);
        updateExperimentData(updatedExperiment); // Update the experiment data
        showAlert("Experiment started", "info");
      } catch (error) {
        showAlert("Could not start experiment", "error");
      }
    }
  };

  const handleStopExperiment = async () => {
    if (selectedExperiment && experimentsApi) {
      try {
        const updatedExperiment = await experimentsApi.StopExperiment(selectedExperiment);
        updateExperimentData(updatedExperiment); // Update the experiment data
        showAlert("Experiment stopped", "info");
      } catch (error) {
        showAlert("Could not stop experiment", "error");
      }
    }
  };

  const updateExperimentData = (updatedExperiment: Experiment) => {
    setExperiments((prevExperiments) =>
      prevExperiments.map((exp) =>
        exp.id === updatedExperiment.id ? updatedExperiment : exp
      )
    );
  };

  const handleLiveView = () => {
    if (selectedExperiment && experiments.find(exp => exp.id === selectedExperiment)?.deviceIds.length) {
      const deviceIds = experiments.find(exp => exp.id === selectedExperiment)?.deviceIds ?? [];
      const deviceIdsQuery = deviceIds.join(',');
      const liveViewUrl = `/experiment/${selectedExperiment}/charts?deviceIds=${encodeURIComponent(deviceIdsQuery)}`;
      window.open(liveViewUrl, "_blank");
    } else {
      showAlert('No device IDs available or no experiment selected', 'error');
    }
  };

  const handleDownloadResults = async () => {
    if (selectedExperiment) {
      if (acquisitionApi != null) {
        const acquisitionConfigurationId: string = experiments.find(ex => ex.id == selectedExperiment)!.acquisitionConfigurationId!;
        try {
          // Make the API request and ensure it is expected as a binary response
          const response = await acquisitionApi.DownloadStoredData(selectedExperiment, acquisitionConfigurationId);

          // Create the Blob URL
          const blobUrl = window.URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${selectedExperiment}.zip`;
          document.body.appendChild(link);
          link.click();
  
          // Clean up the link and blob URL
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
  
          showAlert('Experiment data downloaded', 'info');
        } catch (error) {
          console.error('Download error:', error);
          showAlert('Could not download experiment data', 'error');
        }
      }
    }
  };
  

  const handleDeleteExperiment = async () => {
    if (experimentsApi && selectedExperiment) {
      try {
        await experimentsApi.DeleteExperiment(selectedExperiment);
        setExperiments(experiments.filter(exp => exp.id !== selectedExperiment));
        showAlert("Successfully deleted archived experiment. Data will no longer be accessible.", "success");
      } catch (error) {
        showAlert("Could not delete archived experiment. Try again later.", "error");
      }
    }
  };

  const handleViewCharts = () => {
    if (selectedExperiment && experiments.find(exp => exp.id === selectedExperiment)?.deviceIds.length) {
      const deviceIds = experiments.find(exp => exp.id === selectedExperiment)?.deviceIds ?? [];
      const deviceIdsQuery = deviceIds.join(',');
      const storedChartsUrl = `/experiment/${selectedExperiment}/storedCharts?deviceIds=${encodeURIComponent(deviceIdsQuery)}`;
      window.open(storedChartsUrl, "_blank");
    } else {
      showAlert('No device IDs available or no experiment selected', 'error');
    }
  };

  const handleArchiveExperiment = async () => {
    if (selectedExperiment) {
      if (experimentsApi != null) {
        try {
          await experimentsApi.ArchiveExperiment(selectedExperiment);
          showAlert('Experiment archived', 'info');
        } catch (error) {
          showAlert('Could not archive experiment', 'error');
        }
      }
    }
  };

  const getFloatingActionButtons = () => {
    const experiment = experiments.find((exp) => exp.id === selectedExperiment);
    if (!experiment) return null;

    const status = getStatus(experiment);

    if (status === "Ended" && experiment.acquisitionMode === "storage") {
      return (
        <>
          <Zoom in={true}>
            <Fab color="primary" aria-label="charts" onClick={handleViewCharts}>
              <ChartsIcon />
            </Fab>
          </Zoom>
          <Zoom in={true}>
            <Fab
              color="secondary"
              aria-label="download"
              onClick={handleDownloadResults}
            >
              <DownloadIcon />
            </Fab>
          </Zoom>
          <Zoom in={true}>
            <Fab
              color="error"
              aria-label="archive"
              onClick={handleArchiveExperiment}
            >
              <DeleteIcon />
            </Fab>
          </Zoom>
        </>
      );
    }

    if (status === "Started") {
      return (
        <>
          <Zoom in={true}>
            <Fab
              color="secondary"
              aria-label="stop"
              onClick={handleStopExperiment}
            >
              <StopIcon />
            </Fab>
          </Zoom>
          <Zoom in={true}>
            <Fab
              color="primary"
              aria-label="live view"
              onClick={handleLiveView}
            >
              <LiveViewIcon />
            </Fab>
          </Zoom>
        </>
      );
    }

    if (status === "Created") {
      return (
        <>
          <Zoom in={true}>
            <Fab
              color="primary"
              aria-label="start"
              onClick={handleStartExperiment}
            >
              <StartIcon />
            </Fab>
          </Zoom>
          <Zoom in={true}>
            <Fab
              color="error"
              aria-label="delete"
              onClick={handleDeleteExperiment}
            >
              <DeleteIcon />
            </Fab>
          </Zoom>
        </>
      );
    }

    return null;
  };

  // Animation for experiments
  const trail = useTrail(experiments.length, {
    from: { opacity: 0, transform: "scale(0.9)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: { tension: 200, friction: 20 },
  });

  return (
    <div>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom>
          Experiments
        </Typography>
        <IconButton color="primary" onClick={fetchExperiments}>
          <RefreshIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        {trail.map((animation, index) => (
          <Grid item xs={12} sm={6} md={4} key={experiments[index].id}>
            <animated.div style={{ ...animation, padding: theme.spacing(1) }}>
              <ButtonBase
                onClick={() => handleCardClick(experiments[index].id)}
                sx={{ width: "100%" }}
              >
                <Box
                  ref={(el) => (cardRefs.current[index] = el!)}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <GlowCard
                    selected={selectedExperiment === experiments[index].id}
                    theme={theme}
                  >
                    {/* Add the image to the card */}
                    <CardMedia
                      component="img"
                      alt="Experiment Image"
                      height="140"
                      image={`https://picsum.photos/seed/${experiments[index].id}/400/600`}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div" sx={{ textAlign: "center" }}>
                        {experiments[index].id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                        Acquisition Mode: {experiments[index].acquisitionMode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                        Device Count: {experiments[index].deviceIds.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                        Created At: {new Date(experiments[index].createdAt).toLocaleString()}
                      </Typography>
                      {experiments[index].startedAt && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                          Started At: {new Date(experiments[index].startedAt!).toLocaleString()}
                        </Typography>
                      )}
                      {experiments[index].endedAt && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                          Ended At: {new Date(experiments[index].endedAt!).toLocaleString()}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 1 }}>
                        <StatusIndicator status={getStatus(experiments[index])} />
                        <Typography variant="body2" color="text.secondary" sx={{ marginLeft: 1 }}>
                          Status: {getStatus(experiments[index])}
                        </Typography>
                      </Box>
                    </CardContent>
                  </GlowCard>
                </Box>
              </ButtonBase>
            </animated.div>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 4,
        }}
      >
        {getFloatingActionButtons()}
      </Box>
    </div>
  );
};

export default ExperimentsPage;
