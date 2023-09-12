import { useState } from "react";
import TextField from '@mui/material/TextField';
import { createNewGame } from "../Api";
import { useNavigate } from 'react-router-dom';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';


function AddGame(props) {
    const [opponent, setOpponent] = useState('');
    const [gameDimension, setGameDimension] = useState('');
    const [insertFailed, setInsertFailed] = useState(false);
    const navigate = useNavigate();


    function handleOpponentChange(e) {
        setOpponent(e.target.value);
    };

    const handleDimensionChange = (event, newDimension) => {
        setGameDimension(newDimension);
      };

    async function createGame(e) {
        e.preventDefault();
        props.setIsLoading(true);
        try {
            const dimensionNum = Number(gameDimension)
            const result = await createNewGame({opponent, dimension: dimensionNum});
            if (result === true) {
                await props.getUserGames();
                props.setShowForm(false);
                props.setIsLoading(false);
            } else {
                setInsertFailed(true);
                props.setIsLoading(false);
            }
        } catch (e) {
            navigate('/error');
        }
    };

    return (
        <form onSubmit={createGame}>
            <TextField id="outlined-basic" label="User to invite" variant="outlined" value={opponent} onChange={handleOpponentChange} />
            <ToggleButtonGroup
                value={gameDimension}
                exclusive
                onChange={handleDimensionChange}
                aria-label="game dimension"
            >
                <ToggleButton value="10" aria-label="10">
                    10X10
                </ToggleButton>
                <ToggleButton value="20" aria-label="20">
                    20X20
                </ToggleButton>
            </ToggleButtonGroup>
            <button type="submit">Invite</button>
            {insertFailed ? 'could not create game' : ''}
        </form>
    );
};

export default AddGame;