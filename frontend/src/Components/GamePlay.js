import BoardGame from './BoardGame';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { performShot } from '../Api';
import styles from './Styles/GamePlay.css';


function GamePlay(props) {
    const navigate = useNavigate();
    const [shotFail, setShotFail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function getIndexesData(rowColData) {
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
    };


    return (
        <div className='container'>
            <div className='error_msg'>
                    {shotFail ? 'could not make this shot' : ''}
            </div>
            <div className='player_board'>
                <h3>{'You'}</h3>
                <BoardGame dimension={props.dimension} shotsRecived={props.shotsRecived} shots={props.shotsRecived} isLoading={isLoading} />
            </div>
            <div className='opponent_board'>
                <h3>{props.opponent}</h3>
                <BoardGame dimension={props.dimension} getIndexesData={getIndexesData} clicked={true} placedShips={props.placedShips} isLoading={isLoading} shots={props.shotsSent} />
            </div>
        </div>
    );
};

export default GamePlay;