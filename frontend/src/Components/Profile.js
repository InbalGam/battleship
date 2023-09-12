import { getProfile, updateNickname } from '../Api';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';


function Profile() {
    const [user, setUser] = useState({});
    const [newNickname, setNewNickname] = useState('');
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [updateFailed, setUpdateFailed] = useState(false);
    const navigate = useNavigate();


    function showNicknameEdit(e) {
        setShow(!show);
    };

    function handleUsernameChange(e) {
        setNewNickname(e.target.value);
    };

    async function getUserProfile() {
        setIsLoading(true);
        try {
            const result = await getProfile();
            if (result.status === 401) {
                navigate('/login');
            } else {
                const jsonData = await result.json();
                console.log(jsonData);
                setUser(prevState => ({
                    ...prevState,
                    username: jsonData.username,
                    nickname: jsonData.nickname,
                    wins: jsonData.user_score.wins,
                    loses: jsonData.user_score.loses
                }));
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    async function submitNewNickname() {
        setIsLoading(true);
        try {
            const result = await updateNickname(newNickname);
            if (result === true) {
                await getUserProfile();
                setShow(false);
                setIsLoading(false);
            } else {
                setUpdateFailed(true);
                setShow(false);
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    useEffect(() => {
        getUserProfile();
    }, []);

    return (
        <div>
            {isLoading ? <CircularProgress size={150} className='loader' /> :
                <div>
                    <p>Your username is {user.username}</p>
                    <div className='nicknameChange'>
                        {show ?
                            <div>
                                <TextField id="outlined-basic" label="Nickname" variant="outlined" value={newNickname} onChange={handleUsernameChange} />
                                <button type="submit" value="Submit" className="submitButton" onClick={submitNewNickname}>submit</button>
                            </div> : <p>Your nickname is {user.nickname}</p>}
                        <button className='editIcon' onClick={showNicknameEdit}><EditIcon /></button>
                    </div>
                    <p>You current score is:</p>
                    <div>
                        <p>wins: {user.wins}</p>
                        <p>loses: {user.loses}</p>
                        <p>total: {user.wins - user.loses}</p>
                    </div>
                    {updateFailed ? 'could not update nickname' : ''}
                </div>}
        </div>
    );
};

export default Profile;