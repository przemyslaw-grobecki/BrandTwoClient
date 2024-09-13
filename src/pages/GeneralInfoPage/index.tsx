import React from 'react';
import { Box, Typography } from '@mui/material';

const GeneralInfoPage: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          lineHeight: '1.3',
          fontSize: { xs: '2rem', md: '2.5rem' },
          textAlign: 'left',
        }}
      >
        Search for BSM physics at TeV scale by exploring transverse polarization of electrons emitted in neutron decay - BRAND experiment
      </Typography>

      {/* Text and Image Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.1rem',
              lineHeight: '1.75',
              color: '#555',
              marginBottom: '1.5rem',
              textAlign: 'justify',
            }}
          >
            Neutron and nuclear beta decay correlation coefficients are linearly sensitive to the exotic scalar and tensor
            interactions that are not included in the Standard Model (SM). The proposed experiment will measure
            simultaneously 11 neutron correlation coefficients (a, A, B, D, H, L, N, R, S , U, V) where 7 of them (H, L, N, R,
            S , U, V) depend on the transverse electron polarization – a quantity that vanishes for the SM weak interaction.
            The neutron decay correlation coefficients H, L, S , U, V were never attempted experimentally before.
          </Typography>
        </Box>

        {/* New Image Section */}
        <Box
          component="img"
          src="/src/assets/images/BRANDrefframe.png" // Add the correct path to your image
          alt="BRAND Reference Frame"
          sx={{
            width: { xs: '100%', md: '40%' }, // Full width on mobile, 40% on larger screens
            borderRadius: '12px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Additional Text */}
      <Typography
        variant="body1"
        sx={{
          fontSize: '1.1rem',
          lineHeight: '1.75',
          color: '#555',
          marginBottom: '1.5rem',
          textAlign: 'justify',
        }}
      >
        The expected ultimate sensitivity of the proposed experiment that currently takes off on the cold neutron beamline PF1B at
        the Institute Laue-Langevin, Grenoble, France, is comparable to that of the planned electron spectrum shape
        measurements in neutron and nuclear beta decays but offers completely different systematics and additional
        sensitivity to imaginary parts of the scalar and tensor couplings. The BRAND project is led by Jagiellonian
        University and financed by the National Science Centre, Poland (NCN) under the grant agreement No. 2021/42/E/ST2/00267 (end on 2027).
        Contact persons: Dagmara Rozpedzik (dagmara.rozpedzik@uj.edu.pl), Kazimierz Bodek (kazimierz.bodek@uj.edu.pl).
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontSize: '1.1rem',
          lineHeight: '1.75',
          color: '#555',
          marginTop: '1.5rem',
          textAlign: 'justify',
        }}
      >
        This is an acquisition system meant to provide a user-friendly interface, to access the capabilities of Brand II ecosystem.
      </Typography>

      {/* Existing Image Section - remains at the bottom */}
      <Box
        component="img"
        src="/src/assets/images/brand_stuff_1.png" // Update this path accordingly
        alt="Brand Experiment Image"
        sx={{
          width: '100%', // Full width image
        //   borderRadius: '12px',
        //   boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          objectFit: 'cover', // Ensure the image is properly scaled
          mt: 4, // Add margin top for space
        }}
      />
    </Box>
  );
};

export default GeneralInfoPage;
