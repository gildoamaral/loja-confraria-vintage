import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const useTokenExpiredNotification = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleTokenExpired = (event) => {
      setMessage(event.detail.message);
      setOpen(true);
    };

    // Escuta o evento customizado de token expirado
    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const NotificationComponent = () => (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={handleClose}
        severity="warning"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );

  return { NotificationComponent };
};

export default useTokenExpiredNotification;
