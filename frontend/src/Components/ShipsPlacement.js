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


function ShipsPlacement(props) {
    const navigate = useNavigate();
    const [choosenShipInd, setChoosenShipInd] = useState('');
    const [deleteShipFail, setDeleteShipFail] = useState(false);
    const [placeShipFail, setPlaceShipFail] = useState('');
    const [startGameFail, setStartGameFail] = useState(false);
    const [shipRowCol, setShipRowCol] = useState({start: [], end: []});
    const [isLoading, setIsLoading] = useState(false);
    const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];


    function getIndexesData(rowColData) {
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
        if (shipRowCol.end.length !== 0) {
            setIsLoading(true);
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
                    setIsLoading(false);
                } else {
                    const jsonData = await result.json();
                    setPlaceShipFail(jsonData.msg);
                    setShipRowCol({start: [], end: []});
                    setChoosenShipInd('');
                    setIsLoading(false);
                }
            } catch (e) {
                navigate('/error');
            }
        }
    };

    function handleChoosenShipChange(e, i) {
        setChoosenShipInd(i);
    };

    async function deleteShip(e) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await deleteAShip(props.game_id, props.placedShips[e.target.value]);
            if (result === true) {
                props.getTheGameInfo();
                setIsLoading(false);
            } else {
                setDeleteShipFail(true);
                setIsLoading(false);
            }
        } catch(e) {
            navigate('/error');
        }
    };
    

    useEffect(() => {
        placeShip();
    }, [shipRowCol]);


    async function ready(e) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await readyToPlay(props.game_id);
            if (result === true) {
                props.getTheGameInfo();
                setIsLoading(false);
            } else {
                setStartGameFail(true);
                setIsLoading(false);
            }
        } catch(e) {
            navigate('/error');
        }
    };

    return (
        <Grid container justifyContent="center" spacing={2}>
            <Grid item xs={4} className='ships'>
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
            </Grid>
            <Grid item xs={'auto'} className='main_board'>
                <BoardGame dimension={props.dimension} placedShips={props.placedShips} getIndexesData={getIndexesData} clicked={true} />
                {isLoading ? <CircularProgress size={150} className='loader' /> : ''}
            </Grid>
            <Grid item xs={2} className='error_msg'>
                {placeShipFail ? <Alert severity="warning">{placeShipFail}</Alert> : ''}
                {deleteShipFail ? <Alert severity="warning">Could not delete ship</Alert> : ''}
                {startGameFail ? <Alert severity="warning">Could not start game</Alert> : ''}
            </Grid>
        </Grid>
    );
};

export default ShipsPlacement;