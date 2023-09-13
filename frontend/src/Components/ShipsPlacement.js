import BoardGame from './BoardGame';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from "react";

function ShipsPlacement(props) {
    const [choosenShipSize, setChoosenShipSize] = useState('');
    const [placedShipSize, setPlacedShipSize] = useState('');

    function handleChoosenShipChange(e, size) {
        console.log(size);
        setChoosenShipSize(size);
    };

    function handlePlacedShipChange(e, size) {
        console.log(size);
        setPlacedShipSize(size);
    };

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
            <BoardGame dimension={props.dimension} placedShips={props.placedShips} />
        </div>
    );
};

export default ShipsPlacement;