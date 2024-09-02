import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

interface NewConfigurationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const NewConfigurationDialog: React.FC<NewConfigurationDialogProps> = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleCreate = () => {
    onCreate(name);
    setName('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Configuration</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Configuration Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCreate} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewConfigurationDialog;
