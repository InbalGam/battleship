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


function ShipsPlacement(props) {
    const navigate = useNavigate();
    const [choosenShipInd, setChoosenShipInd] = useState('');
    const [deleteShipFail, setDeleteShipFail] = useState(false);
    const [coloredCells, setColoredCells] = useState([]);
    const [startGameFail, setStartGameFail] = useState(false);
    //const [shipRowCol, setShipRowCol] = useState({start: [], end: []});
    const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];


    // async function placeShip() {
    //     props.setIsLoading(true);
    //     try {
    //         const newShipData = {
    //             ship_size: Number(props.remainingShips[choosenShipInd]),
    //             start_row: shipRowCol.start[0],
    //             start_col: shipRowCol.start[1],
    //             end_row: shipRowCol.end[0],
    //             end_col: shipRowCol.end[1]
    //         }
    //         const result = await placeAShip(props.game_id, newShipData);
    //         if (result === true) {
    //             props.getTheGameInfo();
    //             props.setIsLoading(false);
    //         } else {
    //             setDeleteShipFail(true);
    //             props.setIsLoading(false);
    //         }
    //     } catch(e) {
    //         navigate('/error');
    //     }
    // };

    function handleChoosenShipChange(e, i) {
        console.log(i);
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

    function cellsToColor() {
        let pairs = [];
        props.placedShips.forEach(ship => {
            // [row, col]
            if (ship.start_row === ship.end_row) {
                for (let i = 0; i <= (ship.end_col - ship.start_col); i++) {
                    pairs.push([ship.start_row, (ship.start_col + i)]);
                }
            } else if (ship.start_col === ship.end_col) {
                for (let i = 0; i <= (ship.end_row - ship.start_row); i++) {
                    pairs.push([(ship.start_row + i), ship.start_col]);
                }
            };
            return pairs;
        });
        setColoredCells(pairs);
    };


    useEffect(() => {
        cellsToColor();
    }, [coloredCells]);


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
        <div className='container'>
            <div className='ships_container'>
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
                    {deleteShipFail ? 'could not delete ship' : ''}
                    {startGameFail ? 'Could not start game' : ''}
                </div>
            </div>
            <div className='main_board'>
                <BoardGame dimension={props.dimension} placedShips={props.placedShips} coloredCells={coloredCells} />
            </div>
        </div>
    );
};

export default ShipsPlacement;