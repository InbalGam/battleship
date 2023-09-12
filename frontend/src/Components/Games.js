import { getGames } from "../Api";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import GameCard from "./GameCard";


function Games() {
    const [userScore, setUserScore] = useState({});
    const [userGameInvitations, setUserGameInvitations] = useState({});
    const [userActiveGames, setUserActiveGames] = useState({});
    const navigate = useNavigate();
    const [insertFailed, setInsertFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                setUserGameInvitations(prevState => ({
                    ...prevState,
                    invitations: jsonData.invitations
                }));
                setUserActiveGames(prevState => ({
                    ...prevState,
                    activeGames: jsonData.active_games
                }));
                setIsLoading(false);
                console.log(jsonData);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    useEffect(() => {
        getUserGames();
    }, []);


    return (
        <div>
            <div className="upperDiv">
                <Fab variant="extended" color="primary" aria-label="add">
                    <AddIcon sx={{ mr: 1 }} className="addGame"/> New Game
                </Fab>
                <div className="userScore">
                    <h3>Your Score:</h3>
                    <p>Wins: {userScore.wins}</p>
                    <p>Loses: {userScore.loses}</p>
                    <p>Total score: {userScore.wins - userScore.loses}</p>
                </div>
            </div>
            <div className="invitationGames">
                <p>Invitations:</p>
                <GameCard />
            </div>
            <div className="ongoingGames">
                <p>Ongoing games:</p>
            </div>
        </div>
    );
};

export default Games;