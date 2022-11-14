import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Card, Stack, TextField, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// date pickers
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { convertToLocalTime } from 'date-fns-timezone';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// hooks
import useAuth from '../../../../hooks/useAuth';
import useIsMountedRef from '../../../../hooks/useIsMountedRef';

// components
import { FormProvider, RHFTextField } from '../../../../components/hook-form';

import axios from '../../../../utils/axios';


// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { enqueueSnackbar } = useSnackbar();

  const isMountedRef = useIsMountedRef();


  const { user } = useAuth();

  const UpdateUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required').email(),
  });

  const defaultValues = {
    email: user?.email || '',
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    birthdate: user?.birthdate || '',
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

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

    try {
      const formattedDate = formatDate(date);
      const headers = { Authorization: `JWT ${accessToken}` };
      await axios.patch('/auth/users/me/', {
        // 'email' : data.email,
        'first_name': data.firstName,
        'last_name': data.lastName,
        'birthdate': formattedDate
      }, { headers });
      enqueueSnackbar('Update success!');
    } catch (error) {
      if (isMountedRef.current) {
        setError('afterSubmit', error);
      }
      console.error(error);
    }
  };

  const [date, setDate] = useState(dayjs(Date.now()));

  return (
    <div>
    { user?.first_name ? (
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} >
        <Stack spacing={3}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                rowGap: 3,
                columnGap: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              <RHFTextField name="email" label="Email Address" />

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
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              {user?.first_name && <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>}


            </Stack>
          </Card>
        </Stack>
      </FormProvider>) : (
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <Card sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <TextField name="givenName" label="Given Name" value={user?.given_name} disabled />
            <TextField name="familyName" label="Family Name" value={user?.family_name} disabled />
            <TextField name="email" label="Email Address" value={user?.email} disabled />
            <TextField name="birthdate" label="Date of Birth" value={user?.birthdate.split("T")[0]} disabled />
            <TextField name="gender" label="Gender" value={user?.gender} disabled />
            <TextField name="phone_number" label="Phone Number" value={user?.phone_number} disabled />
            

          </Box>
        </Card>
      </Stack>)}
      </div>
  );
}
