import React, { useEffect, useState, useMemo, useRef } from 'react';
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
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IExperimentsApi } from 'client/Experiments/IExperimentsApi';
import { Experiment } from 'client/Experiments/Experiment';
import { useTrail, animated } from '@react-spring/web';
import { useAlert } from 'components/Providers/AlertContext';

const GlowCard = styled(Card)(
  ({ theme, selected }: { theme: any; selected: boolean }) => ({
    transition: 'transform 0.3s, box-shadow 0.3s, top 0.3s',
    transform: selected ? 'scale(1.05)' : 'scale(1)',
    border: '1px solid #e0e0e0',
    boxShadow: selected
      ? `0px 10px 30px rgba(0, 0, 0, 0.1), 0 0 30px ${theme.palette.primary.main}`
      : '0px 5px 15px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    top: selected ? '-10px' : '0',
    zIndex: selected ? 2 : 1,
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.1), 0 0 30px ${theme.palette.primary.main}`,
      zIndex: 3,
    },
  })
);

const ArchivedExperimentsPage: React.FC = () => {
  const theme = useTheme();
  const { showAlert } = useAlert();
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const experimentsApi: IExperimentsApi | undefined = useMemo(() => {
    let experimentsApi: IExperimentsApi | undefined;
    if (brandClientTokenInfo != null) {
      experimentsApi = client.getExperimentsApi(brandClientTokenInfo);
    }
    return experimentsApi;
  }, [client, brandClientTokenInfo]);

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const fetchArchivedExperiments = async () => {
      if (experimentsApi != null) {
        try {
          const experiments = await experimentsApi.GetArchivedExperiments();
          setExperiments(experiments);
        } catch (error) {
          showAlert("Could not fetch archived experiments. Try again later.", "error");
        }
      }
    };
    fetchArchivedExperiments();
  }, [experimentsApi]);

  const handleCardClick = (id: string) => {
    setSelectedExperiment(id);
  };

  const handleDeleteExperiment = async (experimentId: string) => {
    if (experimentsApi) {
      try {
        await experimentsApi.DeleteExperiment(experimentId);
        setExperiments(experiments.filter((exp) => exp.id !== experimentId));
        setSelectedExperiment(null); // Clear selected experiment after delete
        showAlert("Successfully deleted archived experiment. Data will no longer be accessible.", "success");
      } catch (error) {
        showAlert("Could not delete archived experiment. Try again later.", "error");
      }
    }
  };

  const handleDownloadData = async (experimentId: string) => {
    if (experimentsApi) {
      try {
        const data = await experimentsApi.DownloadExperimentData(experimentId);
        const blob = new Blob([data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${experimentId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showAlert("Successfully downloaded archived experiments data.", "success");
      } catch (error) {
        showAlert("Could not download the archived experiments data. Try again later.", "error");
      }
    }
  };

  const getFloatingActionButtons = () => {
    const experiment = experiments.find((exp) => exp.id === selectedExperiment);
    if (!experiment) return null;

    return (
      <>
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="download"
            onClick={() => handleDownloadData(experiment.id)}
          >
            <DownloadIcon />
          </Fab>
        </Zoom>
        <Zoom in={true}>
          <Fab
            color="error"
            aria-label="delete"
            onClick={() => handleDeleteExperiment(experiment.id)}
          >
            <DeleteIcon />
          </Fab>
        </Zoom>
      </>
    );
  };

  // Animation for experiments
  const trail = useTrail(experiments.length, {
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 },
  });

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Archived Experiments
      </Typography>
      <Grid container spacing={3}>
        {trail.map((animation, index) => (
          <Grid item xs={12} sm={6} md={4} key={experiments[index].id}>
            <animated.div style={{ ...animation, padding: theme.spacing(1) }}>
              <ButtonBase onClick={() => handleCardClick(experiments[index].id)} sx={{ width: '100%' }}>
                <Box
                  ref={(el) => (cardRefs.current[index] = el!)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <GlowCard selected={selectedExperiment === experiments[index].id} theme={theme}>
                    <CardMedia
                      component="img"
                      alt="Experiment Image"
                      height="140"
                      image={`https://picsum.photos/seed/${experiments[index].id}/400/600`}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                        {experiments[index].id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Acquisition Mode: {experiments[index].acquisitionMode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Device Count: {experiments[index].deviceIds.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Created At: {new Date(experiments[index].createdAt).toLocaleString()}
                      </Typography>
                      {experiments[index].startedAt && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          Started At: {new Date(experiments[index].startedAt!).toLocaleString()}
                        </Typography>
                      )}
                      {experiments[index].endedAt && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          Ended At: {new Date(experiments[index].endedAt!).toLocaleString()}
                        </Typography>
                      )}
                      {experiments[index].archivedAt && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          Archived At: {new Date(experiments[index].archivedAt!).toLocaleString()}
                        </Typography>
                      )}
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
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 4,
        }}
      >
        {getFloatingActionButtons()}
      </Box>
    </div>
  );
};

export default ArchivedExperimentsPage;
