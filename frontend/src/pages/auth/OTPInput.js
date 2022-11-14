// @mui
import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Page from '../../components/Page';
import Image from '../../components/Image';
// sections
import { OnboardingForm } from '../../sections/auth/register';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const SectionStyle = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 650,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: 'auto',
  padding: theme.spacing(16, 0),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function Register() {
  const mdUp = useResponsive('up', 'md');

  return (
    <Page title="Onboarding">
      <RootStyle>
        {mdUp && (
          <SectionStyle>
            <Typography variant="h3" sx={{ px: 13, mt: 0, mb: 5 }}>
              We would like to know your business better to help you match with similar stores.
            </Typography>
            <Image
              alt="onboarding"
              src="https://img.freepik.com/free-vector/onboarding-concept-illustration_114360-4120.jpg?w=1060&t=st=1648611505~exp=1648612105~hmac=fd869e10ac24696f08a97566b46459665cd2b2b6026c558e8eec0b708f58bdea"
            />
          </SectionStyle>
        )}

        <Container maxWidth="sm">
          <ContentStyle>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Please help us fill in this form.
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>Serving you, always.</Typography>
              </Box>
            </Box>
            <OnboardingForm />
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
