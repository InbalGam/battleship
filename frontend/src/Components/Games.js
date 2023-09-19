import { getGames } from "../Api";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import GameCard from "./GameCard";
import AddGame from "./AddGame";
import CircularProgress from '@mui/material/CircularProgress';
import styles from './Styles/Games.css';


function Games() {
    const [userScore, setUserScore] = useState({});
    const [userGameInvitations, setUserGameInvitations] = useState([]);
    const [userActiveGames, setUserActiveGames] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    async function getUserGames() {
        setIsLoading(true);
        try {
            const result = await getGames();
            if (result.status === 401) {
                navigate('/login');
            } else {
                const jsonData = await result.json();
                setUserScore(prevState => ({
                    ...prevState,
                    wins: jsonData.user_score.wins,
                    loses: jsonData.user_score.loses
                }));
                setUserGameInvitations(jsonData.invitations);
                setUserActiveGames(jsonData.active_games);
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    useEffect(() => {
        getUserGames();
    }, []);


    function showFormFunc() {
        setShowForm(!showForm);
    };


    return (
        <div>
            {isLoading ? <CircularProgress size={150} className='loader' /> :
                <div>
                    <div className="upperDiv">
                        <div className='new_game_form'>
                            {showForm ? <AddGame setShowForm={setShowForm} setIsLoading={setIsLoading} getUserGames={getUserGames} /> : 
                                <Fab variant="extended" color="primary" aria-label="add" onClick={showFormFunc} className='addGame' >
                                    <AddIcon sx={{ mr: 1 }} className="addGame" /> New Game
                                </Fab>}
                        </div>
                        <div className="userScore">
                            <h3>Your Score:</h3>
                            <p className='wins'>Wins: {userScore.wins}</p>
                            <p className='loses'>Loses: {userScore.loses}</p>
                            <p>Total score: {userScore.wins - userScore.loses}</p>
                        </div>
                    </div>
                    <div className="invitationGames">
                        <h3>Invitations:</h3>
                        <ul>
                            {userGameInvitations.map((game, ind) =>
                                <li key={ind}>
                                    <GameCard invite={true} game={game} active={false} getUserGames={getUserGames} />
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="ongoingGames">
                        <h3>Ongoing games:</h3>
                        <ul>
                            {userActiveGames.map((game, ind) =>
                                <li key={ind}>
                                    <GameCard invite={false} game={game} active={true} />
                                </li>
                            )}
                        </ul>
                    </div>
                </div>}
        </div>
    );
};

export default Games;