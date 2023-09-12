import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { acceptGame, deleteAGame } from '../Api';
import CircularProgress from '@mui/material/CircularProgress';


function GameCard(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [authFailed, setAuthFailed] = useState(false);
    const navigate = useNavigate();

    async function onClickAccept(e) {
        setIsLoading(true);
        try {
            const result = await acceptGame(props.game.game_id);
            if (result === true) {
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
                            <Typography variant="h5" component="div" className='gameInfo'>
                                {props.game.board_dimension+'X'+props.game.board_dimension } | {'1 shot per turn'}
                                {props.active ? <div><p className='gameHits' style={{color: 'green'}}>| {props.game.hits} hits</p> <p className='gameBombed' style={{color: 'red'}}>| {props.game.bombed} bombed </p></div> : ''}
                            </Typography>
                        </CardContent>
                    </Link>
                    <CardActions>
                        {props.invite ? (props.game.createdByMe ? '' : <Button size="small" onClick={onClickAccept} className='gameCardActionButtons'>Accept</Button>) : ''}
                        {props.invite ? (props.game.createdByMe ? '' : <Button size="small" onClick={onClickDelete} className='gameCardActionButtons'>Delete</Button>) : ''}
                    </CardActions>
                </Card>}
            {authFailed ? 'could not update game' : ''}
        </>
    );
};

export default GameCard;