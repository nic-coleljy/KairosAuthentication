import * as Yup from 'yup';
import { useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, Alert, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// date pickers
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { convertToLocalTime } from 'date-fns-timezone';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';



export default function RegisterForm() {
  const { register } = useAuth();

  const isMountedRef = useIsMountedRef();

  const [showPassword, setShowPassword] = useState(false);

  const [date, setDate] = useState(dayjs(Date.now()));

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First name required'),
    lastName: Yup.string().required('Last name required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
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

  const onSubmit = async (data) => {
    const formattedDate = formatDate(date);

    try {
      await register(data.email, data.password, data.firstName, data.lastName, formattedDate);
    } catch (error) {
      reset();
      if (isMountedRef.current) {
        setError('afterSubmit', error);
      }
    }
  };



  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField name="firstName" label="First name" />
          <RHFTextField name="lastName" label="Last name" />
        </Stack>

        <RHFTextField name="email" label="Email address" />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
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

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Register
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
