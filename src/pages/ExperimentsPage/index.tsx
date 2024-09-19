import React, { useEffect, useState, useMemo, useRef } from "react";
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
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Visibility as LiveViewIcon,
  BarChart as ChartsIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useBrandClientContext } from "components/Providers/BrandClientContext";
import { IExperimentsApi } from "client/Experiments/IExperimentsApi";
import { Experiment } from "client/Experiments/Experiment";
import { useTrail, animated } from "@react-spring/web";
import { useNavigate } from "react-router-dom";
import StatusIndicator from "components/StatusIndicatorComponent"; // Import the StatusIndicator component
import { useAlert } from "components/Providers/AlertContext";

const GlowCard = styled(Card)(
  ({ theme, selected }: { theme: any; selected: boolean }) => ({
    transition: "transform 0.3s, box-shadow 0.3s, top 0.3s, box-shadow 1s",
    transform: selected ? "scale(1.05)" : "scale(1)",
    boxShadow: selected ? `0 0 30px ${theme.palette.primary.main}` : "none",
    position: "relative",
    top: selected ? "-10px" : "0", // Move selected cards higher
    zIndex: selected ? 2 : 1, // Ensure selected cards are on top
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: `0 0 30px ${theme.palette.primary.main}`,
      zIndex: 3, // Ensure hovered card is on top, but below selected cards
    },
    "&:active": {
      transform: "scale(1.05)",
      boxShadow: `0 0 30px ${theme.palette.primary.main}`,
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

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(
    null
  );
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const fetchExperiments = async () => {
      try{
        if (experimentsApi != null) {
          let experiments = await experimentsApi.GetRelevantExperiments();
          setExperiments(experiments);
        }
      } catch(error) {
        showAlert('Could not fetch active experiments. Try again later.', 'error');
      }
    };
    fetchExperiments();
  }, [experimentsApi]);

  useEffect(() => {
    if (cardRefs.current.length > 0) {
      const heights = cardRefs.current.map((ref) => ref.offsetHeight);
      const widths = cardRefs.current.map((ref) => ref.offsetWidth);
      setMaxHeight(Math.max(...heights));
      setMaxWidth(Math.max(...widths));
    }
  }, [experiments]);

  const handleCardClick = (id: string) => {
    setSelectedExperiment(id);
  };

  const handleStartExperiment = async () => {
    if (selectedExperiment) {
      // alert(`Starting experiment: ${selectedExperiment}`);
      // Add logic to start the experiment
      if (experimentsApi != null) {
        try {
          await experimentsApi.StartExperiment(selectedExperiment);
          showAlert('Experiment started', 'info');
        } catch (error) {
          showAlert('Could not start experiment', 'error');
        }
      }
    }
  };

  const handleStopExperiment = async () => {
    if (selectedExperiment) {
      if (experimentsApi != null) {
        try {
          await experimentsApi.StopExperiment(selectedExperiment);
          showAlert('Experiment stopped', 'info');
        } catch (error) {
          showAlert('Could not stop experiment', 'error');
        }
      }
    }
  };

  const handleLiveView = () => {
    if (selectedExperiment && experiments.find(exp => exp.id == selectedExperiment)?.deviceIds.length) {
      // Join the device IDs into a comma-separated string for the query parameter
      const deviceIds = experiments.find(exp => exp.id == selectedExperiment)?.deviceIds ?? [];
      const deviceIdsQuery = deviceIds.join(',');
  
      // Construct the URL with the selected experiment and the device IDs as query parameters
      const liveViewUrl = `/experiment/${selectedExperiment}/charts?deviceIds=${encodeURIComponent(deviceIdsQuery)}`;
  
      alert(`Viewing live data for experiment: ${selectedExperiment}`);
      window.open(liveViewUrl, "_blank");
    } else {
      alert('No device IDs available or no experiment selected');
    }
  };
  
  const handleDownloadResults = async () => {
    if (selectedExperiment) {
      if (experimentsApi != null) {
        try {
          var response: Blob = await experimentsApi.DownloadExperimentData(selectedExperiment);
          const blobUrl = window.URL.createObjectURL(response);

          // Step 4: Create a download link and programmatically click it
          const link = document.createElement('a');
          link.href = blobUrl;

          // Optionally, you can give the file a default name
          link.download = 'downloaded-file.zip';

          // Append the link to the document and click it to open the file save dialog
          document.body.appendChild(link);
          link.click();

          // Clean up: Remove the link after triggering the download
          document.body.removeChild(link);

          // Release the blob URL after use
          window.URL.revokeObjectURL(blobUrl);

          showAlert('Experiment data downloaded', 'info');
        } catch (error) {
          showAlert('Could not download experiment data', 'error');
        }
      }
    }
  };

  const handleDeleteExperiment = async () => {
    if (experimentsApi && selectedExperiment) {
      try{
        await experimentsApi.DeleteExperiment(selectedExperiment);
        setExperiments(experiments.filter(exp => exp.id !== selectedExperiment));
        showAlert("Sucessfully deleted archived experiment. Data will no longer be accessible.", "success");
      } catch(error) {
        showAlert("Could not delete archived experiment. Try again later.", "error");
      }
    }
  };

  const handleViewCharts = () => {
    if (selectedExperiment && experiments.find(exp => exp.id == selectedExperiment)?.deviceIds.length) {
      // Join the device IDs into a comma-separated string for the query parameter
      const deviceIds = experiments.find(exp => exp.id == selectedExperiment)?.deviceIds ?? [];
      const deviceIdsQuery = deviceIds.join(',');
  
      // Construct the URL with the selected experiment and the device IDs as query parameters
      const storedChartsUrl = `/experiment/${selectedExperiment}/storedCharts?deviceIds=${encodeURIComponent(deviceIdsQuery)}`;
  
      alert(`Viewing stored data for experiment: ${selectedExperiment}`);
      window.open(storedChartsUrl, "_blank");
    } else {
      alert('No device IDs available or no experiment selected');
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

  // Animation for experiments
  const trail = useTrail(experiments.length, {
    from: { opacity: 0, transform: "scale(0.9)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: { tension: 200, friction: 20 },
  });

  const getFloatingActionButtons = () => {
    const experiment = experiments.find((exp) => exp.id === selectedExperiment);
  
    if (!experiment) return null;
  
    const status = getStatus(experiment);
  
    if (status === "Ended") {
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
              aria-label="delete"
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
  

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Experiments
      </Typography>
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
                    maxHeight={maxHeight ?? "auto"}
                    maxWidth={maxWidth ?? "auto"}
                  >
                    <CardMedia
                      component="img"
                      alt="Experiment Image"
                      height="140"
                      image={`https://picsum.photos/seed/${experiments[index].id}/400/600`} // Random image
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {experiments[index].id}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <StatusIndicator
                          status={getStatus(experiments[index])}
                        />{" "}
                        {/* Add StatusIndicator */}
                        <Typography variant="body2" color="text.secondary">
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

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 4, // Ensure FABs are on top of other elements
        }}
      >
        {getFloatingActionButtons()}
      </Box>
    </div>
  );
};

export default ExperimentsPage;
