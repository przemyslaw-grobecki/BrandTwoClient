import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ButtonBase, Card, CardContent, CardMedia, Grid, styled, Typography, useTheme, Box, Fab, Zoom, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IExperimentsApi } from 'client/Experiments/IExperimentsApi';
import { Experiment } from 'client/Experiments/Experiment';
import { useTrail, animated } from '@react-spring/web';
import { useAlert } from 'components/Providers/AlertContext';

const GlowCard = styled(Card)(({ theme, selected }: { theme: any; selected: boolean }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s, top 0.3s, box-shadow 1s',
  transform: selected ? 'scale(1.05)' : 'scale(1)',
  boxShadow: selected
    ? `0 0 30px ${theme.palette.primary.main}`
    : 'none',
  position: 'relative',
  top: selected ? '-10px' : '0',
  zIndex: selected ? 2 : 1,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 30px ${theme.palette.primary.main}`,
    zIndex: 3,
  },
  '&:active': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 30px ${theme.palette.primary.main}`,
  },
}));

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
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const fetchArchivedExperiments = async () => {
      if (experimentsApi != null) {
        try {
          const experiments = await experimentsApi.GetArchivedExperiments();
          setExperiments(experiments);
        } catch(error) {
          showAlert("Could not fetch archived experiments. Try again later.", "error");
        }
      }
    };
    fetchArchivedExperiments();
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

  const handleDeleteExperiment = async (experimentId: string) => {
    if (experimentsApi) {
      try{
        await experimentsApi.DeleteExperiment(experimentId);
        setExperiments(experiments.filter(exp => exp.id !== experimentId));
        showAlert("Sucessfully deleted archived experiment. Data will no longer be accessible.", "success");
      } catch(error) {
        showAlert("Could not delete archived experiment. Try again later.", "error");
      }
    }
  };

  const handleDownloadData = async (experimentId: string) => {
    if (experimentsApi) {
      try {
        const data = await experimentsApi.DownloadExperimentData(experimentId);
        // Logic to handle the file download
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
      } catch(error) {
        showAlert("Could not download the archived experiments data. Try again later.", "error");
      }
    }
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
                  <GlowCard
                    selected={selectedExperiment === experiments[index].id}
                    theme={theme}
                    maxHeight={maxHeight ?? 'auto'}
                    maxWidth={maxWidth ?? 'auto'}
                  >
                    <CardMedia
                      component="img"
                      alt="Experiment Image"
                      height="140"
                      image={`https://picsum.photos/seed/${experiments[index].id}/400/600`}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {experiments[index].name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: Archived
                      </Typography>
                    </CardContent>
                  </GlowCard>
                </Box>
              </ButtonBase>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Tooltip title="Download Data">
                  <Fab color="primary" onClick={() => handleDownloadData(experiments[index].id)}>
                    <DownloadIcon />
                  </Fab>
                </Tooltip>
                <Tooltip title="Delete Experiment">
                  <Fab color="error" onClick={() => handleDeleteExperiment(experiments[index].id)}>
                    <DeleteIcon />
                  </Fab>
                </Tooltip>
              </Box>
            </animated.div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ArchivedExperimentsPage;
