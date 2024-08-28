import React from 'react';
import { Box } from '@mui/material';

const StatusIndicator = ({ status }: { status: string }) => {
  let color;

  switch (status) {
    case 'Ended':
      color = 'red';
      break;
    case 'Started':
      color = 'green';
      break;
    case 'Created':
      color = 'yellow';
      break;
    default:
      color = 'gray'; // Fallback color for unknown status
  }

  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'inline-block',
        marginRight: 1,
      }}
    />
  );
};

export default StatusIndicator;
