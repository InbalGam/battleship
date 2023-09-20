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


function GamePlay(props) {
    const navigate = useNavigate();
    const [shotFail, setShotFail] = useState(false);
    const [notMyTurn, setNotMyTurn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function getIndexesData(rowColData) {
        if (props.myTurn) {
            setIsLoading(true);
            try {
                const result = await performShot(props.game_id, { row: rowColData[0], col: rowColData[1] });
                if (result === true) {
                    props.getTheGameInfo();
                    setIsLoading(false);
                } else {
                    setShotFail(true);
                    setIsLoading(false);
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
                    <div className={props.myTurn ? 'player_turn' : ''}><Avatar className='player_avatar' >You</Avatar></div>
                </Grid>
                <Grid item xs={12} >
                    <BoardGame dimension={props.dimension} shotsSent={props.shotsSent} shots={props.shotsSent} clicked={true} getIndexesData={getIndexesData} />
                    {isLoading ? <CircularProgress size={150} className='loader' /> : ''}
                </Grid>
            </Grid>
            <Grid container item xs={'auto'}>
                <Grid item xs={12} className='player_names_container'>
                    <div className={props.myTurn ? '' : 'player_turn'}><Avatar className='opponent_avatar' >{props.opponent[0]}</Avatar></div>
                </Grid>
                <Grid item xs={12} >
                    <BoardGame dimension={props.dimension} placedShips={props.placedShips} shots={props.shotsRecived} />
                    {isLoading ? <CircularProgress size={150} className='loader' /> : ''}
                </Grid>
            </Grid>
            <Grid item xs={12} className='game_chat'>
                <Chat />
            </Grid>
        </Grid>
    );
};

export default GamePlay;