import BoardGame from './BoardGame';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState, useEffect } from "react";
import Fab from '@mui/material/Fab';
import { readyToPlay, deleteAShip, placeAShip } from '../Api';
import { useNavigate } from 'react-router-dom';
import styles from './Styles/ShipsPlacement.css';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { alphabet } from '../utils';


function ShipsPlacement(props) {
    const navigate = useNavigate();
    const [choosenShipInd, setChoosenShipInd] = useState('');
    const [deleteShipFail, setDeleteShipFail] = useState(false);
    const [placeShipFail, setPlaceShipFail] = useState('');
    const [startGameFail, setStartGameFail] = useState(false);
    const [shipRowCol, setShipRowCol] = useState({start: [], end: []});


    function onCellClick(rowColData) {
        if (shipRowCol.start.length === 0) {
            setShipRowCol(prev => ({
                ...prev,
                start: [(rowColData[0]), (rowColData[1])]
            }));
        } else {
            setShipRowCol(prev => ({
                ...prev,
                end: [(rowColData[0]), (rowColData[1])]
            }));
        }
    };


    async function placeShip() {
        props.setIsLoading(true);
        try {
            const newShipData = {
                ship_size: Number(props.remainingShips[choosenShipInd]),
                start_row: shipRowCol.start[0],
                start_col: shipRowCol.start[1],
                end_row: shipRowCol.end[0],
                end_col: shipRowCol.end[1]
            }
            const result = await placeAShip(props.game_id, newShipData);
            if (result.status === 200) {
                props.getTheGameInfo();
                props.setIsLoading(false);
            } else {
                const jsonData = await result.json();
                setPlaceShipFail(jsonData.msg);
                setShipRowCol({start: [], end: []});
                setChoosenShipInd('');
                props.setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    function handleChoosenShipChange(e, i) {
        setChoosenShipInd(i);
    };

    async function deleteShip(e) {
        e.preventDefault();
        props.setIsLoading(true);
        try {
            const result = await deleteAShip(props.game_id, props.placedShips[e.target.value]);
            if (result === true) {
                props.getTheGameInfo();
                props.setIsLoading(false);
            } else {
                setDeleteShipFail(true);
                props.setIsLoading(false);
            }
        } catch(e) {
            navigate('/error');
        }
    };
    

    useEffect(() => {
        if (shipRowCol.end.length !== 0) {
            placeShip();
        }
    }, [shipRowCol]);


    async function ready(e) {
        e.preventDefault();
        props.setIsLoading(true);
        try {
            const result = await readyToPlay(props.game_id);
            if (result === true) {
                props.getTheGameInfo();
                props.setIsLoading(false);
            } else {
                setStartGameFail(true);
                props.setIsLoading(false);
            }
        } catch(e) {
            navigate('/error');
        }
    };

    return (
        <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={'auto'} className='ships'>
                <div>
                    <h3>Remaining ships:</h3>
                    <ToggleButtonGroup
                        orientation="vertical"
                        value={choosenShipInd}
                        exclusive
                        onChange={handleChoosenShipChange} >
                        {props.remainingShips.map((shipSize, ind) =>
                            <ToggleButton value={ind} aria-label="remaining_ships_list">
                                {shipSize} squares
                            </ToggleButton>)}
                    </ToggleButtonGroup>
                </div>
                <div>
                    <h3>Placed ships:</h3>
                    <ButtonGroup
                        orientation="vertical" >
                        {props.placedShips.map((ship, ind) =>
                            <Button value={ind} aria-label="placed_ships_list" onClick={deleteShip}>
                                {ship.ship_size} squares {alphabet[ship.start_row - 1] + ship.start_col} - {alphabet[ship.end_row - 1] + ship.end_col}
                            </Button>)}
                    </ButtonGroup>
                    {props.remainingShips.length === 0 ?
                        <div className='start_game_button'>
                            <Fab variant="extended" color="primary" aria-label="add" onClick={ready} >
                                Start Game
                            </Fab>
                        </div> : ''}
                </div>
                <div className='error_msg'>
                    {placeShipFail ? <Alert severity="warning">{placeShipFail}</Alert> : ''}
                    {deleteShipFail ? <Alert severity="warning">Could not delete ship</Alert> : ''}
                    {startGameFail ? <Alert severity="warning">Could not start game</Alert> : ''}
                </div>
            </Grid>
            <Grid item xs={'auto'} className='main_board'>
                <BoardGame dimension={props.dimension} placedShips={props.placedShips} onCellClick={onCellClick} clicked={true} shipRowCol={shipRowCol} />
                {props.isLoading ? <CircularProgress size={150} className='loader' /> : ''}
            </Grid>
        </Grid>
    );
};

export default ShipsPlacement;