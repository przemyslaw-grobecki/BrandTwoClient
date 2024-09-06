import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, TextField, Box, Typography, Container, Paper, CssBaseline } from "@mui/material";
import testImage from "assets/images/test.png";
import { useBrandClientContext } from "components/Providers/BrandClientContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const SignUpPage: React.FC = () => {
  const { client } = useBrandClientContext();
  const navigate = useNavigate(); // For navigation between pages

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await client.Register(values.email, values.password);
        // Navigate to the SignInPage after successful sign up
        navigate("/signin"); 
      } catch (error) {
        console.error("Failed to register", error);
      }
    },
  });

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          backgroundImage: `url(${testImage})`,
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
            elevation={12}
            sx={{
              padding: 4,
              position: "relative",
              zIndex: 0,
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
                Sign Up
              </Typography>
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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    background: "linear-gradient(135deg, #1976d2 0%, #2a5298 100%)",
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default SignUpPage;
