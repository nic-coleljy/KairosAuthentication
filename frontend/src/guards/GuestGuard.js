import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
// hooks
import useAuth from '../hooks/useAuth';
// routes
import { PATH_DASHBOARD, PATH_AUTH } from '../routes/paths';

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
  children: PropTypes.node,
};

export default function GuestGuard({ children }) {
  
  const { isAuthenticated, isNew } = useAuth();

  if (isAuthenticated ) {
    if(!isNew){
      return <Navigate to={PATH_DASHBOARD.general.app} />;
    } 
    return <Navigate to={PATH_AUTH.sendEmail} />;
  }

  return <>{children}</>;
}
