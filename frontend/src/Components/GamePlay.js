import BoardGame from './BoardGame';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { performShot } from '../Api';
import styles from './Styles/GamePlay.css';
import Chat from './Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';


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
        <>
                <div className='container'>
                    <Fab aria-label="refresh" onClick={props.getTheGameInfo}> <RefreshIcon /> </Fab>
                    <div className='error_msg'>
                        {shotFail ? 'could not make this shot' : ''}
                        {notMyTurn ? 'not your turn to make a shot' : ''}
                    </div>
                    <div className='opponent_board'>
                        <h3 className={props.myTurn ? 'player_turn' : ''}>{'You'}</h3>
                        <BoardGame dimension={props.dimension} shotsSent={props.shotsSent} shots={props.shotsSent} clicked={true} getIndexesData={getIndexesData} />
                    </div>
                    <div className='player_board'>
                        <h3 className={props.myTurn ? '' : 'opponent_turn'}>{props.opponent}</h3>
                        <BoardGame dimension={props.dimension} placedShips={props.placedShips} shots={props.shotsRecived} />
                    </div>
                    <div className='chat_container'>
                        <Chat />
                    </div>
                </div>
        </>
    );
};

export default GamePlay;