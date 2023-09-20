import { useState } from "react";
import TextField from '@mui/material/TextField';
import { createNewGame } from "../Api";
import { useNavigate } from 'react-router-dom';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseIcon from '@mui/icons-material/Close';
import Fab from '@mui/material/Fab';
import styles from './Styles/AddGame.css';
import Alert from '@mui/material/Alert';


function AddGame(props) {
    const [opponent, setOpponent] = useState('');
    const [gameDimension, setGameDimension] = useState('10');
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

    function showFormFunc() {
        props.setShowForm(false);
    };

    return (
        <form onSubmit={createGame} className="addGame_form">
            <Fab size="small" color="primary" aria-label="close" onClick={showFormFunc} className='closeGame' >
                <CloseIcon className="closeForm" />
            </Fab>
            <div className="addGame_form_container">
            <TextField id="filled-basic" label="User to invite" variant="filled" value={opponent} onChange={handleOpponentChange} className="textField" />
            <label htmlFor="dimension" className="label">Dimension:</label>
            <ToggleButtonGroup
                value={gameDimension}
                exclusive
                onChange={handleDimensionChange}
                aria-label="game dimension"
                className="dimension_toggle_group"
                id='dimension'
            >
                <ToggleButton value="10" aria-label="10" className="dimension_toggle">
                    10X10
                </ToggleButton>
                <ToggleButton value="20" aria-label="20" className="dimension_toggle">
                    20X20
                </ToggleButton>
            </ToggleButtonGroup>
            <button type="submit" className="submitButton">Invite</button>
            {insertFailed ? <Alert severity="warning">Could not create game</Alert> : ''}
            </div>
        </form>
    );
};

export default AddGame;