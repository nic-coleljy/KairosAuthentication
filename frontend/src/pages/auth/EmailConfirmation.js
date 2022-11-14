import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
// hooks
import useAuth from '../../hooks/useAuth';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';

// assets
import { SentIcon } from '../../assets';
import LoadingScreen from '../../components/LoadingScreen';


// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function EmailConfirmation() {
  const [verified, setVerified] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const { activate } = useAuth();

  const { uid, token } = useParams();

  // eslint-disable-next-line
  window.onload = function () {
    fetchData();
  };

  const fetchData = async () => {
    await activate(uid, token).then(() => { 
      setVerified(true) 
      setLoading(false);
    }).catch((error) => {
      console.log(error)
      setLoading(false);
    });
  }

  if (isLoading) {
    return <LoadingScreen />;
  }


  return (
    <Page title="Email Confirmation" sx={{ height: 1 }}>
      <RootStyle>
        <Container>
          <Box sx={{ maxWidth: 850, mx: 'auto' }}>
            {!verified ? (
              <>
                <Typography variant="h3" paragraph>
                  The Activation Link is Invalid, Return to the Login Page
                </Typography>
                <Button variant="contained" fullWidth size="large" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
                  Back
                </Button>
              </>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <SentIcon sx={{ mb: 5, mx: 'auto', height: 160 }} />
                <Typography variant="h3" gutterBottom>
                  Your account has already been activated, return to Login Page to Login
                </Typography>
                <Button size="large" variant="contained" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 5 }}>
                  Back
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}
