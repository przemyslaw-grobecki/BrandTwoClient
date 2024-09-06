import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { BrandClientContextProvider } from 'components/Providers/BrandClientContext'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AlertProvider } from 'components/Providers/AlertContext'

const theme = createTheme();


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <BrandClientContextProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </BrandClientContextProvider>
      </AlertProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
