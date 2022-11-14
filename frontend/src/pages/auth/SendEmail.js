import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
// assets
import { SentIcon } from '../../assets';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function SendEmail() {

  return (
    <Page title="Email Confirmation" sx={{ height: 1 }}>
      <RootStyle>
        {/* <LogoOnlyLayout /> */}

        <Container>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
              <Box sx={{ textAlign: 'center' }}>
                <SentIcon sx={{ mb: 5, mx: 'auto', height: 160 }} />

                {/* <Typography variant="h3" gutterBottom>
                  Request sent successfully
                </Typography> */}
                {/* <Typography>
                  We have sent an account activation link to &nbsp;
                  <strong>{email}</strong>
                  <br />
                  Please check your email.
                </Typography> */}
                <Typography>
                  We have sent an account activation link to the email you have specified earlier
                  <br />
                  Please check your email.
                </Typography>

                <Button size="large" variant="contained" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 5 }}>
                  Return to Login
                </Button>
              </Box>
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}
