import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import testImage from "assets/images/test.png";
import ujLogo from "assets/images/logo_uj_eng.png"
import { CssBaseline } from '@mui/material';

const SignInPage: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    console.log({
      email,
      password,
    });
  };

  return (
    <>
    <CssBaseline/>
    <Box
      sx={{
        backgroundImage: `url(${testImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container component="main"
        maxWidth="xs" 
        sx={{ 
          position: 'relative',
          mt: 15
        }}
      >
        <Paper elevation={0}
          sx={{
            position: 'absolute', 
            top: -30, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            padding: 2, 
            width: '78%',
            zIndex: 1,
            background: 'linear-gradient(135deg, #1976d2 0%, #2a5298 100%)',
            color: 'white'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Brand Two
            </Typography>
          </Box>
        </Paper>

        <Paper 
          elevation={12}
          sx={{
            padding: 4,
            paddingTop: 8, // Make sure there is space for the floating paper
            position: 'relative',
            zIndex: 0, // Ensure this is below the top paper
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 ,
                   background: 'linear-gradient(135deg, #1976d2 0%, #2a5298 100%)',
                }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
    </>
  );
};

export default SignInPage;
