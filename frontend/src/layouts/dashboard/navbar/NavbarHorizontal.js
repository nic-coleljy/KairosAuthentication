import { memo, useEffect } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Container } from '@mui/material';
// config
import { HEADER } from '../../../config';
// components
import { NavSectionHorizontal } from '../../../components/nav-section';
//
import navConfig from './NavConfig';
import navConfig2 from './NavConfig2';

// hooks
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  transition: theme.transitions.create('top', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  width: '100%',
  position: 'fixed',
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(1, 0),
  boxShadow: theme.customShadows.z8,
  top: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

function NavbarHorizontal() {

  const { user } = useAuth();

  const config = (user?.is_superuser || user?.is_staff) ? navConfig : navConfig2;

  useEffect(() => {
    if(!user?.is_user){
      window.location.reload(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RootStyle>
      <Container maxWidth={false}>
        <NavSectionHorizontal navConfig={config} />
      </Container>
    </RootStyle>
  );
}

export default memo(NavbarHorizontal);
