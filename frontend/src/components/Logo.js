import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box } from '@mui/material';

import { ReactComponent as ReactLogo } from '../assets/logo_full.svg';


// ----------------------------------------------------------------------

Logo.propTypes = {
  disabledLink: PropTypes.bool,
};

export default function Logo({ disabledLink = false }) {

  const logo = (
    <Box sx={{ width: 65, height: 65 }}>
      <div style={{ margin: 'auto' }}>
        <ReactLogo
          style={{ width: 205, height: 205, margin: 'auto', 'paddingBottom': '7em', 'paddingRight': '8.5em' }}
        />
      </div>
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}
