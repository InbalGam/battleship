import CircularProgress from '@mui/material/CircularProgress';
import { getGameInfo } from "../Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fab from '@mui/material/Fab';
import ShipsPlacement from './ShipsPlacement';
import GamePlay from './GamePlay';
import styles from './Styles/Game.css';
import CelebrationIcon from '@mui/icons-material/Celebration';


function Game() {
    const navigate = useNavigate();
    const { game_id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [opponent, setOpponent] = useState({});
    const [player, setPlayer] = useState({});
    const [phase, setPhase] = useState('');
    const [winner, setWinner] = useState(false);
    const [remainingShips, setRemainingShips] = useState([]);
    const [placedShips, setPlacedShips] = useState([]);
    const [myTurn, setMyTurn] = useState(false);
    const [shotsSent, setShotsSent] = useState([]);
    const [shotsRecived, setShotsRecived] = useState([]);
    const [state, setState] = useState('');
    const [dimension, setDimension] = useState(0);

    async function getTheGameInfo() {
        setIsLoading(true);
        try {
            const result = await getGameInfo(game_id);
            const jsonData = await result.json();
            if (result.status === 401) {
                navigate('/login');
            } else if ((result.status === 400) && (jsonData.msg === 'Game is in state invited')) {
                setState('invited');
                setIsLoading(false);
            } else {
                setOpponent({opponentNickname: jsonData.opponent, opponentImage: jsonData.opponentImage});
                setPlayer({playerNickname: jsonData.player, playerImage: jsonData.playerImage});
                setPhase(jsonData.phase);
                setDimension(jsonData.dimension);
                if (jsonData.phase === 'finished') {
                    console.log(jsonData);
                    setWinner(jsonData.i_won);
                } else if (jsonData.phase === 'placing_pieces') {
                    console.log(jsonData);
                    setRemainingShips(jsonData.remaining_ships);
                    setPlacedShips(jsonData.placed_ships);
                } else if (jsonData.phase === 'gamePlay') {
                    setMyTurn(jsonData.my_turn);
                    setPlacedShips(jsonData.placed_ships);
                    setShotsSent(jsonData.shots_sent);
                    setShotsRecived(jsonData.shots_recieved);
                }
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    useEffect(() => {
        getTheGameInfo();
    }, []);


    return (
        <div>
                <div>
                    {state === 'invited' ?
                        (isLoading ? <CircularProgress size={150} className='loader' /> : 
                        <div className='game_not_started'>
                            <p>Waiting for opponent to accept game</p>
                            <Fab aria-label="refresh" onClick={getTheGameInfo}> <RefreshIcon /> </Fab>
                        </div>) : ''} 

                    {phase === 'waiting_for_other_player' ?
                        (isLoading ? <CircularProgress size={150} className='loader' /> : <div className='game_not_started'>
                            <p>Waiting for {opponent.opponentNickname} to finish placing ships</p>
                            <Fab aria-label="refresh" onClick={getTheGameInfo}> <RefreshIcon /> </Fab>
                        </div>) : ''}

                    {phase === 'finished' ?
                        <div className='winning'>
                            {winner ? <div className='winner'><h3>You won</h3> <CelebrationIcon/></div> : <h3>You Lost</h3>}
                        </div> : ''}

                    {phase === 'placing_pieces' ? <ShipsPlacement remainingShips={remainingShips} placedShips={placedShips} dimension={dimension} getTheGameInfo={getTheGameInfo} game_id={game_id} setIsLoading={setIsLoading} isLoading={isLoading} /> : ''}

                    {phase === 'gamePlay' ? <GamePlay placedShips={placedShips} dimension={dimension} getTheGameInfo={getTheGameInfo} game_id={game_id} 
                                            myTurn={myTurn} opponent={opponent} player={player} shotsSent={shotsSent} shotsRecived={shotsRecived} setIsLoading={setIsLoading} isLoading={isLoading} /> : ''}
                </div>
        </div>
    );
};

export default Game;