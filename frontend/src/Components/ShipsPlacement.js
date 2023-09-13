import BoardGame from './BoardGame';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState, useEffect } from "react";

function ShipsPlacement(props) {
    const [choosenShipSize, setChoosenShipSize] = useState('');
    const [placedShipSize, setPlacedShipSize] = useState('');
    const [coloredCells, setColoredCells] = useState([]);

    function handleChoosenShipChange(e, size) {
        console.log(size);
        setChoosenShipSize(size);
    };

    function handlePlacedShipChange(e, size) {
        console.log(size);
        setPlacedShipSize(size);
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
    }, []);

    return (
        <div>
            <div>
                <div>
                    <h3>Remaining ships:</h3>
                    <ToggleButtonGroup
                        orientation="vertical"
                        value={choosenShipSize}
                        exclusive
                        onChange={handleChoosenShipChange}>
                        {props.remainingShips.map((shipSize, ind) =>
                        <ToggleButton value={shipSize} aria-label="remaining_ships_list">
                            {shipSize} squares
                        </ToggleButton>)}
                    </ToggleButtonGroup>
                </div>
                <div>
                    <h3>Placed ships:</h3>
                    <ToggleButtonGroup
                        orientation="vertical"
                        value={placedShipSize}
                        exclusive
                        onChange={handlePlacedShipChange}>
                        {props.placedShips.map((ship, ind) =>
                        <ToggleButton value={ship.ship_size} aria-label="placed_ships_list">
                            {ship.ship_size} squares {ship.start_col} - {ship.end_row}
                        </ToggleButton>)}
                    </ToggleButtonGroup>
                </div>
            </div>
            <BoardGame dimension={props.dimension} placedShips={props.placedShips} coloredCells={coloredCells} />
        </div>
    );
};

export default ShipsPlacement;