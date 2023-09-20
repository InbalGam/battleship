import { useState } from "react";
import {register} from '../Api';
import {validateEmail} from '../utils';
import { useNavigate} from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import styles from './Styles/Register.css';
import Alert from '@mui/material/Alert';


function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [validUsername, setValidUsername] = useState(true);
    const [registerAuth, setRegisterAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    function handleUsernameChange(e) {
        setUsername(e.target.value);
        setValidUsername(validateEmail(e.target.value));
    };

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    };

    function handleNicknameChange(e) {
        setNickname(e.target.value);
    };


    async function submitForm(e) {
        e.preventDefault();
        
        if ((password.length >= 8) && (nickname.length >= 3) && validUsername) {
            try {
                setIsLoading(true);
                const result = await register(username, password, nickname);
                const jsonData = await result.json();
                if (result.status === 201) {
                    setUsername('');
                    setPassword('');
                    setNickname('');
                    setValidUsername(true);
                    navigate('/login?register=1');
                    setIsLoading(false);
                } else {
                    setRegisterAuth(true);
                    setIsLoading(false);
                }
            } catch (e) {
                navigate('/error');
            }
        }
    };


    return (
        <div className="register_container">
            <div className="registerMain">
                <h2 className='registerH'>Battleship</h2>
                <form onSubmit={submitForm} className='registerForm'>
                    <TextField id="filled-basic" label="Email" variant="filled" value={username} onChange={handleUsernameChange} className="textField" />
                    {username && !validUsername ? <Alert severity="warning">Not a valid email</Alert> : ''}
                    <TextField id="filled-basic" type='password' label="Password" variant="filled" value={password} onChange={handlePasswordChange} className="textField" />
                    {password && (password.length < 8) ? <Alert severity="warning">Password is less than 8 characters</Alert> : ''}
                    <TextField id="filled-basic" label="Nickname" variant="filled" value={nickname} onChange={handleNicknameChange} className="textField" />
                    {nickname && (nickname.length < 3) ? <Alert severity="warning">Nickname is less than 3 characters</Alert> : ''}
                    {isLoading ? <CircularProgress size={150} className='loader' /> : <button type="submit" value="Submit" className="submitButton">Register</button>}
                    {registerAuth ? <Alert severity="warning">Could not register</Alert> : ''}
                </form>
            </div>
        </div>
    );
};

export default Register;