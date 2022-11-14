import PropTypes from 'prop-types';
import { Container, Alert, AlertTitle } from '@mui/material';
import jwtDecode from 'jwt-decode';


// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  accessibleRoles: PropTypes.array, // Example ['admin', 'leader']
  children: PropTypes.node
};

const useCurrentRole = () => {
  // Logic here to get current user role
  let role  = 'user';
  const token = window.localStorage.getItem('accessToken');
  const decoded = jwtDecode(token);

  if(decoded.is_superuser){
    role = 'superadmin';
  } else if(decoded.is_staff){
    role = 'admin';
  }

  return role;
};

export default function RoleBasedGuard({ accessibleRoles, children }) {
  const currentRole = useCurrentRole();

  if (!accessibleRoles.includes(currentRole)) {
    return (
      <Container>
        <Alert severity="error">
          <AlertTitle>Permission Denied</AlertTitle>
          You do not have permission to access this page
        </Alert>
      </Container>
    );
  }

  return <>{children}</>;
}
