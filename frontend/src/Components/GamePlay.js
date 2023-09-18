import BoardGame from './BoardGame';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { performShot } from '../Api';
import styles from './Styles/GamePlay.css';
import Chat from './Chat';


function GamePlay(props) {
    const navigate = useNavigate();
    const [shotFail, setShotFail] = useState(false);
    const [notMyTurn, setNotMyTurn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function getIndexesData(rowColData) {
        if (props.myTurn) {
            setIsLoading(true);
        try {
            const result = await performShot(props.game_id, {row: rowColData[0], col: rowColData[1]});
            if (result === true) {
                props.getTheGameInfo();
                setIsLoading(false);
            } else {
                setShotFail(true);
                setIsLoading(false);
            }
        } catch(e) {
            navigate('/error');
        }
        } else {
            setNotMyTurn(true);
        }
    };


    return (
        <div className='container'>
            <div className='error_msg'>
                    {shotFail ? 'could not make this shot' : ''}
                    {notMyTurn ? 'not your turn to make a shot' : ''}
            </div>
            <div className='player_board'>
                <h3 className={props.myTurn ? 'player_turn' : ''}>{'You'}</h3>
                <BoardGame dimension={props.dimension} shotsSent={props.shotsSent} shots={props.shotsSent} isLoading={isLoading} clicked={true} getIndexesData={getIndexesData} />
            </div>
            <div className='opponent_board'>
                <h3 className={props.myTurn ? '' : 'opponent_turn'}>{props.opponent}</h3>
                <BoardGame dimension={props.dimension} placedShips={props.placedShips} isLoading={isLoading} shots={props.shotsRecived} />
            </div>
            <div className='chat_container'>
                <Chat />
            </div>
        </div>
    );
};

export default GamePlay;