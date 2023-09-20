import BoardGame from './BoardGame';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { performShot } from '../Api';
import styles from './Styles/GamePlay.css';
import Chat from './Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';


function GamePlay(props) {
    const navigate = useNavigate();
    const [shotFail, setShotFail] = useState(false);
    const [notMyTurn, setNotMyTurn] = useState(false);

    async function getIndexesData(rowColData) {
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
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Fab aria-label="refresh" onClick={props.getTheGameInfo}> <RefreshIcon /> </Fab>
            </Grid>
            <Grid item xs={12}>
                {shotFail ? <Alert severity="warning" className='alert'>Could not make this shot</Alert> : ''}
                {notMyTurn ? <Alert severity="warning" className='alert'>Not your turn to make a shot</Alert> : ''}
            </Grid>
            <Grid item xs={6}>
                <h3 className={props.myTurn ? 'player_turn' : ''}><Avatar className='player_avatar' >You</Avatar></h3>
            </Grid>
            <Grid item xs={6}>
                <h3 className={props.myTurn ? '' : 'opponent_turn'}><Avatar className='opponent_avatar' >{props.opponent[0]}</Avatar></h3>
            </Grid>
            <Grid item xs={6}>
                <BoardGame dimension={props.dimension} shotsSent={props.shotsSent} shots={props.shotsSent} clicked={true} getIndexesData={getIndexesData} />
            </Grid>
            <Grid item xs={6}>
                <BoardGame dimension={props.dimension} placedShips={props.placedShips} shots={props.shotsRecived} />
            </Grid>
            <Grid item xs={12}>
                <Chat />
            </Grid>
        </Grid>
    );
};

export default GamePlay;