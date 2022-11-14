import { capitalCase } from 'change-case';
import {useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import UserNewForm from '../../sections/@dashboard/user/UserNewForm';
import LoadingScreen from '../../components/LoadingScreen';

import axios from '../../utils/axios';

// eslint-disable-next-line react-hooks/exhaustive-deps
// ----------------------------------------------------------------------

export default function UserCreate() {
  const { themeStretch } = useSettings();
  const [ data, setData ] = useState();

  const { pathname } = useLocation();
  const { id = '' } = useParams();
  const [isLoading, setLoading] = useState(true);
  const isEdit = pathname.includes('edit');
  
  useEffect(() => {
    const initialize = async () => {
      await axios.get(`/auth/admin/user-crud/?user_id=${id}`).catch((err) => {console.log(err)}).then((res) => {
        setLoading(true);
        setData(res.data);
        setLoading(false);
      });
      
    };
    initialize();
    // eslint-disable-next-line
  }, []);
      

  

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Page title="User: Create a new user">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new user' : 'Edit user'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'User', href: PATH_DASHBOARD.user.list },
            { name: !isEdit ? 'New user' : capitalCase(data.first_name) },
          ]}
        />
        <UserNewForm isEdit={isEdit} user={data} />
      </Container>
    </Page>
  );
}
