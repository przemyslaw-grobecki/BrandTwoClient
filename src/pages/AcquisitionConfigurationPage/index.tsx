import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import { IDevicesApi } from 'client/Devices/IDevicesApi';
import { IAcquisitonApi } from 'client/Acquisition/IAcquisitionApi';
import { AcquisitionConfiguration } from 'client/Acquisition/AcquisitionConfiguration';
import NewConfigurationDialog from 'components/NewConfigurationDialogComponent';
import { useTheme } from '@mui/material/styles';

const AcquisitionConfigurationPage: React.FC = () => {
  const { client, brandClientTokenInfo } = useBrandClientContext();
  const { deviceId } = useParams<{ deviceId: string }>();
  const theme = useTheme(); 
  const [configurations, setConfigurations] = useState<AcquisitionConfiguration[]>([]);
  const [selectedConfiguration, setSelectedConfiguration] = useState<AcquisitionConfiguration | null>(null);
  const [originalConfiguration, setOriginalConfiguration] = useState<AcquisitionConfiguration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  useEffect(() => {
    const fetchConfigurations = async () => {
      if (client && brandClientTokenInfo) {
        const acquisitionApi = client.getAcquisitionApi(brandClientTokenInfo) as IAcquisitonApi;
        const configs = await acquisitionApi.GetAcquisitionConfigurations();
        setConfigurations(configs);
      }
    };
    fetchConfigurations();
  }, [client, brandClientTokenInfo, deviceId]);

  const handleSelectConfiguration = (config: AcquisitionConfiguration) => {
    setSelectedConfiguration(config);
    setOriginalConfiguration({ ...config }); 
    setIsSaveEnabled(false);
  };

  const handleAddNewConfiguration = async (name: string) => {
    if (client && brandClientTokenInfo) {
      const acquisitionApi = client.getAcquisitionApi(brandClientTokenInfo) as IAcquisitonApi;
      const newConfig = await acquisitionApi.AddAcquisitionConfiguration(name);
      setConfigurations([...configurations, newConfig]);
      handleSelectConfiguration(newConfig); 
    }
    setDialogOpen(false); 
  };

  const handleFieldChange = (field: keyof AcquisitionConfiguration, value: any) => {
    if (selectedConfiguration) {
      const updatedConfiguration = { ...selectedConfiguration, [field]: value };
      setSelectedConfiguration(updatedConfiguration);
      setIsSaveEnabled(JSON.stringify(updatedConfiguration) !== JSON.stringify(originalConfiguration));
    }
  };

  const handleSaveConfiguration = async () => {
    if (client && brandClientTokenInfo && selectedConfiguration) {
      const acquisitionApi = client.getAcquisitionApi(brandClientTokenInfo) as IAcquisitonApi;
      await acquisitionApi.EditAcquisitionConfiguration(selectedConfiguration.id, selectedConfiguration);

      // Update the configurations list with the saved configuration
      setConfigurations((prevConfigs) =>
        prevConfigs.map((config) =>
          config.id === selectedConfiguration.id ? selectedConfiguration : config
        )
      );

      setOriginalConfiguration({ ...selectedConfiguration });
      setIsSaveEnabled(false);
      alert('Configuration saved successfully!');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Acquisition Configurations for {deviceId}
      </Typography>
      <Grid container spacing={3}>
        {configurations.map((config) => (
          <Grid item xs={12} sm={6} md={4} key={config.id}>
            <Card
              onClick={() => handleSelectConfiguration(config)}
              sx={{
                border: selectedConfiguration?.id === config.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                boxShadow: selectedConfiguration?.id === config.id ? `0 0 10px ${theme.palette.primary.main}` : 'none',
                transition: 'box-shadow 0.3s, border 0.3s',
              }}
            >
              <CardContent>
                <Typography variant="h6">{config.name}</Typography>
                <Typography variant="body2">Output Mode: {config.outputMode}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
          Add New Configuration
        </Button>
      </Box>
      <NewConfigurationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleAddNewConfiguration}
      />
      {selectedConfiguration && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5">Editing: {selectedConfiguration.name}</Typography>
          {/* Render fields to edit the selected configuration */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Output Directory"
                fullWidth
                value={selectedConfiguration.outputDirectory}
                onChange={(e) => handleFieldChange('outputDirectory', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Output Mode"
                type="number"
                fullWidth
                value={selectedConfiguration.outputMode}
                onChange={(e) => handleFieldChange('outputMode', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Width"
                type="number"
                fullWidth
                value={selectedConfiguration.windWidth}
                onChange={(e) => handleFieldChange('windWidth', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Offset"
                type="number"
                fullWidth
                value={selectedConfiguration.windOffset}
                onChange={(e) => handleFieldChange('windOffset', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Ext Search Marg"
                type="number"
                fullWidth
                value={selectedConfiguration.windExtSearchMarg}
                onChange={(e) => handleFieldChange('windExtSearchMarg', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Rej Marg"
                type="number"
                fullWidth
                value={selectedConfiguration.windRejMarg}
                onChange={(e) => handleFieldChange('windRejMarg', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Width 2"
                type="number"
                fullWidth
                value={selectedConfiguration.windWidth2}
                onChange={(e) => handleFieldChange('windWidth2', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Offset 2"
                type="number"
                fullWidth
                value={selectedConfiguration.windOffset2}
                onChange={(e) => handleFieldChange('windOffset2', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Ext Search Marg 2"
                type="number"
                fullWidth
                value={selectedConfiguration.windExtSearchMarg2}
                onChange={(e) => handleFieldChange('windExtSearchMarg2', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wind Rej Marg 2"
                type="number"
                fullWidth
                value={selectedConfiguration.windRejMarg2}
                onChange={(e) => handleFieldChange('windRejMarg2', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Almost Full Level"
                type="number"
                fullWidth
                value={selectedConfiguration.almostFullLevel}
                onChange={(e) => handleFieldChange('almostFullLevel', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="IRQ Wait"
                type="number"
                fullWidth
                value={selectedConfiguration.irqWait}
                onChange={(e) => handleFieldChange('irqWait', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedConfiguration.eveAlignMode}
                    onChange={(e) => handleFieldChange('eveAlignMode', e.target.checked)}
                  />
                }
                label="Eve Align Mode"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Period"
                type="number"
                fullWidth
                value={selectedConfiguration.period}
                onChange={(e) => handleFieldChange('period', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time Delay"
                type="number"
                fullWidth
                value={selectedConfiguration.timeDelay}
                onChange={(e) => handleFieldChange('timeDelay', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedConfiguration.opticalBridgeTriggerControl}
                    onChange={(e) => handleFieldChange('opticalBridgeTriggerControl', e.target.checked)}
                  />
                }
                label="Optical Bridge Trigger Control"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Flipper Period"
                type="number"
                fullWidth
                value={selectedConfiguration.flipperPeriod}
                onChange={(e) => handleFieldChange('flipperPeriod', Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedConfiguration.twoDC}
                    onChange={(e) => handleFieldChange('twoDC', e.target.checked)}
                  />
                }
                label="Two DC"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedConfiguration.threeDC}
                    onChange={(e) => handleFieldChange('threeDC', e.target.checked)}
                  />
                }
                label="Three DC"
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveConfiguration}
              disabled={!isSaveEnabled}
            >
              Save Configuration
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AcquisitionConfigurationPage;
