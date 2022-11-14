import { isValidToken, setSession, verify, sign } from '../utils';
// import jwtDecode from 'jwt-decode';
import { verify, sign } from 'jsonwebtoken';
// import axios from './axios';

export default function BankSSOUserInfo() {

    // FUNCTION IS TO RETRIEVE USER INFO FROM BANK SSO ENDPOINT
    // https://smurnauth-production.fly.dev/oauth/userinfo
    // NEED TO DISCUSS WITH KS TO INTEGRATE TO FRONTEND
    // need to put function into backend as CORS error again
    // need to get access token from db/client's browser
    // need to introspect token, check if token has expired or not
    // i.e. CURRENT TIME > (created_at + expires_in) from post req res
    
    // getting access token from client's browser
    const acctoken = localStorage.getItem('accessToken')
    const TargetURL = "http://localhost:8000/auth/get-info"
    
    async function getinfo() {
        try {
            await fetch(TargetURL, {
            method: 'GET',
            headers: {
                'Authorization': authheader,
            },
            }).then((response) => {
                document.write(response)
                return response.json();
            }).then((data) => {
                console.log(data)
            })
            } catch (error) {
                if (error.response) {
                console.log(error.response.status)
                } else {
                console.log(error)
                }
            }
        }
    // if token still valid, GET request to end point via backend
    if (isValidToken(acctoken)) {
        const authheader = 'Bearer '
        authheader.concat(acctoken)
        const userInfo = getinfo()
        console.log(userInfo)
        document.write(JSON.stringify(userInfo))
    } else {
        console.log(error)
    }

}
