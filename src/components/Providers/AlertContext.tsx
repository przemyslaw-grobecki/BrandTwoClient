import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// Define the shape of the alert
type Alert = {
  message: string;
  severity: AlertColor; // 'success', 'error', 'warning', 'info'
};

// Define the shape of the alert context
type AlertContextType = {
  showAlert: (message: string, severity: AlertColor) => void;
};

// Create the context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = (message: string, severity: AlertColor) => {
    setAlert({ message, severity });
  };

  const handleClose = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert: showAlert }}>
      {children}
      {alert && (
        <Snackbar
          open={!!alert}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleClose} severity={alert.severity} variant="filled">
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('UseAlert must be used within a AlertProvider');
  }
  return context;
};
