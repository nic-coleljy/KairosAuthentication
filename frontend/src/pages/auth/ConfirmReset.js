import { useState } from 'react';
import * as Yup from 'yup';

import { Link as RouterLink, useParams } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Container, Typography, IconButton, InputAdornment, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, RHFTextField } from '../../components/hook-form';
import Iconify from '../../components/Iconify';


// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
// assets
import { SentIcon } from '../../assets';

import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
    display: 'flex',
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function ConfirmReset() {
    const [sent, setSent] = useState(false);

    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const { uid, token } = useParams();


    const ResetSchema = Yup.object().shape({
        password: Yup.string().required('Password is required'),
        repassword: Yup.string().required('Re-type Password is required'),
    });

    const defaultValues = {
        password: '',
        repassword: ''
    };

    const methods = useForm({
        resolver: yupResolver(ResetSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        isSubmitting,
    } = methods;

    const onSubmit = async (data) => {
        await axios.post('/auth/users/reset_password_confirm/', {
            'uid': uid,
            'token': token,
            'new_password': data.password,
            're_new_password': data.repassword,
        }).catch((error) => {
            console.log(error);
            setError("An error has occured");
        });

        setSent(true);
    };

    return (
        <Page title="Reset Password" sx={{ height: 1 }}>
            <RootStyle>
                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Container>
                        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                            {!sent ? (
                                <>
                                    <Stack spacing={3}>

                                        <Typography sx={{ color: 'text.secondary', mb: 5 }}>
                                            Please enter the new Password
                                        </Typography>

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

                                        <RHFTextField
                                            name="repassword"
                                            label="Retype Password"
                                            type={showPassword ? 'text' : 'repassword'}
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

                                        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                                            Change Password
                                        </LoadingButton>

                                        <Button fullWidth size="large" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 1 }}>
                                            Back
                                        </Button>
                                    </Stack>
                                </>
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <SentIcon sx={{ mb: 5, mx: 'auto', height: 160 }} />

                                    {error === "" ?
                                        <Typography variant="h3" gutterBottom>
                                            Request sent successfully
                                        </Typography> :
                                        <Typography variant="h3" gutterBottom>
                                            {error}
                                        </Typography>
                                    }

                                    <Button size="large" variant="contained" component={RouterLink} to={PATH_AUTH.login} sx={{ mt: 5 }}>
                                        Back
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Container>
                </FormProvider>
            </RootStyle>
        </Page>
    );
}
