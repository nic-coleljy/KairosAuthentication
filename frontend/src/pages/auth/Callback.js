import useAuth from '../../hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';


export default function Callback() {

  const { sso } = useAuth();

  let result = window.location.search;
  result = result.substring(6,)
  const authcode = result
  const SSOJsonBody = {
    'client_id': 'sRVQpIMvEgdBIeFd-oOC8ZNMG0tpw3jO49tbPAID9NE',
    'client_secret': 'wZcO5zHv3NR_GIDUY10B3Zg5T_WwTIPJiAYdkH6I4gs',
    'code': authcode,
    'grant_type': 'authorization_code',
    'redirect_uri': 'http://localhost:3000/auth/callback'
  }

  // eslint-disable-next-line
  window.onload = function () {
    fetchData();
  };

  const fetchData = async () => {
    await sso(SSOJsonBody).catch((error) => {
      console.log(error)
    });
  }

    return <LoadingScreen />;
    
}
