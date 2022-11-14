import jwtDecode from 'jwt-decode';
import { verify, sign } from 'jsonwebtoken';
//
import axios from './axios';

// ----------------------------------------------------------------------

const isValidToken = async (accessToken) => {
  if (!accessToken) {
    return false;
  }

  let valid = false;

  // ----------------------------------------------------------------------

  const decoded = jwtDecode(accessToken);

  if(decoded.iss){
    // use sso verification
    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;
    valid = decoded.exp > currentTime;

  } else {
    await axios.post('/auth/jwt/verify/', {
      "token": accessToken
    }).then((res) => { if (res.status === 200){valid = true} }).catch((error) => {
      console.log(error);
    });
  }

  return valid

};

const getRefreshToken = async (refreshToken) => {
  await axios.post('/auth/jwt/refresh/', {
    "refresh": refreshToken
  }).then((res) => {     
    setSession(res.data.access);
  }).catch((error) => {
    console.log(error);
  });
}

 const handleTokenExpired = (exp) => {
  let expiredTimer;

  window.clearTimeout(expiredTimer);
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;
  // console.log(timeLeft);
  expiredTimer = window.setTimeout(() => {
    console.log('access token expired, trying refresh token');
    // You can do what ever you want here, like show a notification
    const refreshToken = window.localStorage.getItem('refreshToken');
    const decoded = jwtDecode(refreshToken);
    if(decoded.exp > currentTime){
      getRefreshToken(refreshToken);
    }
  }, timeLeft);
};

// ----------------------------------------------------------------------

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    // This function below will handle when token is expired
    const decoded = jwtDecode(accessToken);
    // Login via SSO will not set refresh
    if(!decoded.iss) handleTokenExpired(decoded.exp);

  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
};


export { isValidToken, setSession, verify, sign };
