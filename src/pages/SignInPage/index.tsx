import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import backgroundImage from "assets/images/login_background.jpg";
import { CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBrandClientContext } from "components/Providers/BrandClientContext";
import { useAlert } from "components/Providers/AlertContext";

const SignInPage: React.FC = () => {
  const { client, brandClientTokenInfo, setBrandClientTokenInfo} = useBrandClientContext();
  const { showAlert } = useAlert();
  const navigate = useNavigate(); // For navigation between pages

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        let response = await client.Login(values.email, values.password);
        setBrandClientTokenInfo(response);
      }catch(error){
        showAlert("Could not authenticate to the BRAND II server. Spróbuj wyłączyć i włączyć.", "error");
      }
    },
  });

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            position: "relative",
            mt: 15,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              top: -30,
              left: "50%",
              transform: "translateX(-50%)",
              padding: 2,
              width: "78%",
              zIndex: 1,
              background: "linear-gradient(135deg, #1976d2 0%, #2a5298 100%)",
              color: "white",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
              position: "relative",
              zIndex: 0, // Ensure this is below the top paper
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                component="form"
                onSubmit={formik.handleSubmit}
                noValidate
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
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
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #2a5298 100%)",
                  }}
                >
                  Sign In
                </Button>
                <Grid container justifyContent="center">
                  <Grid item>
                    <Link
                      variant="body2"
                      onClick={() => navigate("/signup")} // Navigate to SignUpPage
                      sx={{ cursor: "pointer" }}
                    >
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
