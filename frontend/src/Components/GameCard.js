import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { acceptGame, deleteAGame } from '../Api';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './Styles/GameCard.css';
import Alert from '@mui/material/Alert';


function GameCard(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [authFailed, setAuthFailed] = useState(false);
    const navigate = useNavigate();

    async function onClickAccept(e) {
        setIsLoading(true);
        try {
            const result = await acceptGame(props.game.game_id);
            if (result === true) {
                props.getUserGames();
                navigate('/games');
                setIsLoading(false);
            } else {
                setAuthFailed(true);
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    async function onClickDelete(e) {
        setIsLoading(true);
        try {
            const result = await deleteAGame(props.game.game_id);
            if (result === true) {
                props.getUserGames();
                navigate('/games');
                setIsLoading(false);
            } else {
                setAuthFailed(true);
                setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };


    return (
        <>
            {isLoading ? <CircularProgress size={150} className='loader' /> :
                <Card sx={{ minWidth: 375 }} className='gameCard' >
                    <Link to={`/games/${props.game.game_id}`} className='gameCardLink'>
                        <CardContent>
                            <Typography sx={{ fontSize: 24 }} gutterBottom >
                                {props.game.opponent}
                            </Typography>
                        </CardContent>
                    </Link>
                    <CardActions>
                        {props.invite ? (props.game.createdByMe ? '' : <Button size="small" onClick={onClickAccept} className='gameCardActionButtons'>Accept</Button>) : ''}
                        {props.invite ? (props.game.createdByMe ? '' : <Button size="small" onClick={onClickDelete} className='gameCardActionButtons'>Delete</Button>) : ''}
                        <div className='gameInfo'>{props.game.board_dimension+'X'+props.game.board_dimension }</div>
                        <div className='gameInfo'>{'1 shot per turn'}</div>
                        {props.active ? 
                            <>
                                <div className='gameInfo'><p className='gameHits' > {props.game.hits} hits</p></div>
                                <div className='gameInfo'><p className='gameBombed' > {props.game.bombed} bombed </p></div>
                            </> : ''}
                    </CardActions>
                </Card>}
            {authFailed ? <Alert severity="warning">Could not update game</Alert> : ''}
        </>
    );
};

export default GameCard;