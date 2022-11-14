import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo , useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// date pickers
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { convertToLocalTime } from 'date-fns-timezone';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, TextField } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import { FormProvider, RHFTextField } from '../../../components/hook-form';

import axios from '../../../utils/axios';


// ----------------------------------------------------------------------

UserNewForm.propTypes = {
  isEdit: PropTypes.bool,
  user: PropTypes.object,
};

export default function UserNewForm({ isEdit, user }) {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email(),
  });

  const [date, setDate] = useState(dayjs(Date.now()));

  const defaultValues = useMemo(
    () => ({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      birthdate : user?.birthdate || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && user) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, user]);

  const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';

  /**
   * Format a date to a string
   *
   * @param date
   */
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleString();

    // Get the timezone from browser using native methods
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateTmp = Date.parse(date.toLocaleString());

    const localDate = convertToLocalTime(dateTmp, {
      timeZone: timezone,
    });

    return format(localDate, DEFAULT_DATE_FORMAT);
  };


  const accessToken = window.localStorage.getItem('accessToken');

  const onSubmit = async (data) => {
    const headers = { Authorization: `JWT ${accessToken}` };
    const formattedDate = formatDate(date);
    if(isEdit){
      try {
        await axios.put('/auth/admin/user-crud/', {
          'email' : data.email,
          'first_name' : data.firstName,
          'last_name' : data.lastName,
          'birthdate' : formattedDate,
          'status' : 'pending'
        }, {headers});
  
        reset();
        enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
        navigate(PATH_DASHBOARD.user.list);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        await axios.post('/auth/admin/user-crud/', {
          'id' : Array.from(Array(20), () => Math.floor(Math.random() * 36).toString(36)).join(''),
          'email' : data.email,
          'first_name' : data.firstName,
          'last_name' : data.lastName,
          'birthdate' : formattedDate,
          'status' : 'pending'
        }, {headers});
  
        reset();
        enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
        navigate(PATH_DASHBOARD.user.list);
      } catch (error) {
        console.error(error);
      }
    }
    
  };


  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              {isEdit?  <RHFTextField name="email" label="Email Address" disabled /> : <RHFTextField name="email" label="Email Address" /> }

              <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disableFuture
                label="Date of Birth"
                openTo="year"
                views={['year', 'month', 'day']}
                value={date}
                onChange={(newValue) => {
                  setDate(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
              </LocalizationProvider>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
    </FormProvider>
  );
}
