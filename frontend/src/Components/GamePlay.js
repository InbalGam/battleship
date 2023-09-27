import BoardGame from './BoardGame';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { performShot } from '../Api';
import styles from './Styles/GamePlay.css';
import Chat from './Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import {baseURL} from '../apiKey';


function GamePlay(props) {
    const navigate = useNavigate();
    const [shotFail, setShotFail] = useState(false);
    const [notMyTurn, setNotMyTurn] = useState(false);

    async function onCellClick(rowColData) {
        setShotFail(false);
        setNotMyTurn(false);
        if (props.myTurn) {
            props.setIsLoading(true);
            try {
                const result = await performShot(props.game_id, { row: rowColData[0], col: rowColData[1] });
                if (result === true) {
                    props.getTheGameInfo();
                    props.setIsLoading(false);
                } else {
                    setShotFail(true);
                    props.setIsLoading(false);
                }
            } catch (e) {
                navigate('/error');
            }
        } else {
            setNotMyTurn(true);
        }
    };


    return (
        <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={12}>
                <Fab aria-label="refresh" onClick={props.getTheGameInfo} className='refreshButton'> <RefreshIcon /> </Fab>
            </Grid>
            <Grid item xs={12}>
                {shotFail ? <Alert severity="warning" className='alert'>Could not make this shot</Alert> : ''}
                {notMyTurn ? <Alert severity="warning" className='alert'>Not your turn to make a shot</Alert> : ''}
            </Grid>
            <Grid container item xs={'auto'}>
                <Grid item xs={12} className='player_names_container'>
                <div className={props.myTurn ? 'player_turn' : ''}>
                    {props.player.playerImage ? 
                        <div className='avatar_image'><Avatar className='avatar_img' alt="Player image" src={`${baseURL}/image/${props.player.playerImage}`}></Avatar> {props.player.playerNickname}</div> 
                    : <div className='avatar_image'><Avatar className='player_avatar' ></Avatar> {props.player.playerNickname}</div>}
                </div>
                </Grid>
                <Grid item xs={12} >
                    <BoardGame dimension={props.dimension} shotsSent={props.shotsSent} shots={props.shotsSent} clicked={true} onCellClick={onCellClick} />
                    {props.isLoading ? <CircularProgress size={150} className='loader' /> : ''}
                </Grid>
            </Grid>
            <Grid container item xs={'auto'}>
                <Grid item xs={12} className='player_names_container'>
                    <div className={props.myTurn ? '' : 'player_turn'}>
                        {props.opponent.opponentImage ? 
                            <div className='avatar_image'><Avatar className='avatar_img' alt="Player image" src={`${baseURL}/image/${props.opponent.opponentImage}`}></Avatar> {props.opponent.opponentNickname}</div> 
                            : <div className='avatar_image'><Avatar className='opponent_avatar' ></Avatar> {props.opponent.opponentNickname}</div>}
                    </div>
                </Grid>
                <Grid item xs={12} >
                    <BoardGame dimension={props.dimension} placedShips={props.placedShips} shots={props.shotsRecived} />
                    {props.isLoading ? <CircularProgress size={150} className='loader' /> : ''}
                </Grid>
            </Grid>
            <Grid item xs={12} className='game_chat'>
                <Chat />
            </Grid>
        </Grid>
    );
};

export default GamePlay;