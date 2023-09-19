import { login } from "../Api";
import { useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import {baseURL} from '../apiKey';
import styles from './Styles/Login.css';
import googleImg from './Styles/images/google.png';


function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authFailed, setAuthFailed] = useState(false);
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function handleUsernameChange(e) {
        setUsername(e.target.value);
    };

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    };

    async function submitLogin(e) {
        setIsLoading(true);
        e.preventDefault();
        try {
            const result = await login(username, password);
            if (result === true) {
                navigate('/games');
                setIsLoading(false);
            } else {
                setAuthFailed(true);
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    return (
        <div className="login_container" aria-label='Photo by Krzysztof Kowalik'>
            <p className={'messages'}>{searchParams.get("logout") ? 'Succefully logged out' : ''}</p>
            <p className={'messages'}>{searchParams.get("register") ? 'Succefully registered, you can log in' : ''}</p>
            <div className="login_register">
                <h1 className='loginH1'>Battleship</h1>
                <form onSubmit={submitLogin} className={'loginForm'}>
                    <TextField id="outlined-basic" label="Username" variant="outlined" value={username} onChange={handleUsernameChange} className="textField" />
                    <TextField id="outlined-basic" label="Password" type={"password"} variant="outlined" value={password} onChange={handlePasswordChange} className="textField" />
                    {isLoading ? <CircularProgress size={150} className='loader' /> : <button type="submit" value="Submit" className="loginButton" >Login</button>}
                </form>
                <div className={'authStatus'}>
                    {authFailed ? 'Username or Password are incorrect, try again' : ''}
                </div>
                <div className="otherLoginOptions">
                    <Link to={`${baseURL}/login/google`} className={'loginGoogleLink'}><div className="google_login"><img src={googleImg} className="imgLogo"/> Login with Google</div></Link>
                </div>
                <Link to='/register' className={'registrationLink'} >Register here</Link>
            </div>
        </div>
    );
};

export default Login;