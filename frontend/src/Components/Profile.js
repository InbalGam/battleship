import { getProfile, updateProfile, loadImage } from '../Api';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import styles from './Styles/Profile.css';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import {baseURL} from '../apiKey';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';


function Profile() {
    const [user, setUser] = useState({});
    const [newNickname, setNewNickname] = useState('');
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
                setUser(jsonData);
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    async function submitNewNickname() {
        setIsLoading(true);
        try {
            const result = await updateProfile({nickname: newNickname, imgId: user.imgId});
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

    async function submitProfileImg(e) {
        e.preventDefault();
        setIsLoading(true);
        let imgId;
        const profileImg = e.target.files[0];
        const data = new FormData();
        data.append('image', profileImg );
        try {
            if (profileImg) {
                const imgResult = await loadImage(data);
                const jsonData = await imgResult.json();
                imgId = jsonData.id;
            } else {
                imgId = null;
            }
            const result = await updateProfile({nickname: user.nickname, imgId: imgId});
            if (result === true) {
                await getUserProfile();
                setIsLoading(false);
            } else {
                setUpdateFailed(true);
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });

    return (
        <div>
            {isLoading ? <CircularProgress size={150} className='loader' /> :
                <div className='profile_container'>
                    <div className='profile_image'>
                        {user.imageName ? <Avatar className='avatar_img' alt="Player image" src={`${baseURL}/image/${user.imageName}`}></Avatar> : <Avatar className='profile_avatar' ></Avatar>}
                        <Fab component="label" variant="contained" className='editProfileImage' > <EditIcon /><VisuallyHiddenInput type="file" onChange={submitProfileImg}/> </Fab>
                    </div>
                    <p>Your username is {user.username}</p>
                    <div className='nicknameChange'>
                        {show ?
                            <div className='nickname_change_form'>
                                <TextField id="outlined-basic" label="Nickname" variant="outlined" value={newNickname} onChange={handleUsernameChange} />
                                <button type="submit" value="Submit" className="submitButton" onClick={submitNewNickname}>submit</button>
                            </div> : <p>Your nickname is {user.nickname}</p>}
                        <Fab color="primary" aria-label="edit" onClick={showNicknameEdit} className='editIcon'> <EditIcon /> </Fab>
                    </div>
                    <div className='userScore'>
                        <p>You current score is:</p>
                        <div>
                            <p className='wins'>wins: {user.user_score.wins}</p>
                            <p className='loses'>Loses: {user.user_score.loses}</p>
                            <p>Total: {user.user_score.wins - user.user_score.loses}</p>
                        </div>
                    </div>
                    {updateFailed ? <Alert severity="warning">Could not update nickname</Alert> : ''}
                </div>}
        </div>
    );
};

export default Profile;