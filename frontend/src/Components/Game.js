import CircularProgress from '@mui/material/CircularProgress';
import { getGameInfo } from "../Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import Fab from '@mui/material/Fab';


function Game() {
    const navigate = useNavigate();
    const { game_id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [opponent, setOpponent] = useState('');
    const [phase, setPhase] = useState('');
    const [winner, setWinner] = useState(false);
    const [remainingShips, setRemainingShips] = useState([]);
    const [placedShips, setPlacedShips] = useState([]);
    const [myTurn, setMyTurn] = useState(false);
    const [shotsSent, setShotsSent] = useState([]);
    const [shotsRecived, setShotsRecived] = useState([]);
    const [state, setState] = useState('');

    async function getTheGameInfo() {
        setIsLoading(true);
        try {
            const result = await getGameInfo(game_id);
            const jsonData = await result.json();
            if (result.status === 401) {
                navigate('/login');
            } else if ((result.status === 400) && (jsonData.msg === 'Game is in state invited')) {
                setState('invited');
            } else {
                setOpponent(jsonData.opponent);
                setPhase(jsonData.phase);
                if (jsonData.phase === 'finished') {
                    setWinner(jsonData.i_won);
                } else if (jsonData.phase === 'placing_pieces') {
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
            {state === 'invited' ?
            <div>
                <p>Waiting for opponent to accept game</p> 
                <Fab aria-label="refresh" onClick={getTheGameInfo}> <RefreshIcon/> </Fab>
            </div> : ''}

            {phase === 'waiting_for_other_player' ?
            <div>
                <p>Waiting for {opponent} to finish placing ships</p> 
                <Fab aria-label="refresh" onClick={getTheGameInfo}> <RefreshIcon/> </Fab>
            </div> : ''}

            {phase === 'finished' ?
            <div>
                 {winner ? <h3>You won</h3> : <h3>You Lost</h3>}
            </div> : ''}
        </div>
    );
};

export default Game;