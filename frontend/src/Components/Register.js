import { useState } from "react";
import {register} from '../Api';
import {validateEmail} from '../utils';
import { useNavigate} from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import styles from './Styles/Register.css';


function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [validUsername, setValidUsername] = useState(true);
    const [registerAuth, setRegisterAuth] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    function handleUsernameChange(e) {
        setUsername(e.target.value);
        setValidUsername(validateEmail(username));
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
                setMsg(jsonData.msg);
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
                    {validUsername ? '' : msg}
                    <TextField id="filled-basic" label="Password" variant="filled" value={password} onChange={handlePasswordChange} className="textField" />
                    {(password.length >= 8) ? '' : msg}
                    <TextField id="filled-basic" label="Nickname" variant="filled" value={nickname} onChange={handleNicknameChange} className="textField" />
                    {(nickname.length >= 3) ? '' : msg}
                    {isLoading ? <CircularProgress size={150} className='loader' /> : <button type="submit" value="Submit" className="submitButton">Register</button>}
                    {registerAuth ? 'Could not register' : ''}
                </form>
            </div>
        </div>
    );
};

export default Register;