import BoardGame from './BoardGame';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { performShot } from '../Api';
import styles from './Styles/GamePlay.css';


function GamePlay(props) {
    const navigate = useNavigate();
    const [shotFail, setShotFail] = useState(false);
    const [shotRowCol, setShotRowCol] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    async function getIndexesData(rowColData) {
        setShotRowCol((prev) => [rowColData, ...prev]);
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

    function checkX(cellsToX, cell) {
        for (let i = 0; i < cellsToX.length; i++) {
            if (cell[0] === cellsToX[i].row && cell[1] === cellsToX[i].col) {
                return cellsToX[i].hit;
            }
        }
        return false;
    };

    return (
        <div className='container'>
            <div className='error_msg'>
                    {shotFail ? 'could not make this shot' : ''}
            </div>
            <div className='player_board'>
                <h3>{'You'}</h3>
                <BoardGame dimension={props.dimension} shots={props.shotsRecived} isLoading={isLoading} checkX={checkX} />
            </div>
            <div className='opponent_board'>
                <h3>{props.opponent}</h3>
                <BoardGame dimension={props.dimension} getIndexesData={getIndexesData} clicked={true} placedShips={props.placedShips} isLoading={isLoading} shots={props.shotsSent} checkX={checkX} />
            </div>
        </div>
    );
};

export default GamePlay;