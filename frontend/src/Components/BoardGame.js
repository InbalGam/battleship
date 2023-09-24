import styles from './Styles/BoardGame.css';
import CloseIcon from '@mui/icons-material/Close';
import { useMemo } from "react";
import { alphabet } from '../utils';


function BoardGame(props) {
    const boardDimension = Array.from(Array(props.dimension).keys());


    function cellsToColor() {
        let pairs = [];
        if (props.placedShips) {
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
        } else if (props.shotsSent) {
             props.shotsSent.forEach(shot => {
                if (shot.hit) {
                    pairs.push([shot.row, shot.col])
                }
                return pairs;
            })
        }
        return pairs;
    };
    let coloredCells = useMemo(() => cellsToColor(), [props.placedShips, props.shotsSent]);


    const checkSubset = (parentArray, subsetArray) => {
        for (let i = 0; i < parentArray.length; i++) {
            if ((parentArray[i][0] === subsetArray[0]) && (parentArray[i][1] === subsetArray[1])) {
                return true;
            }
        };
        return false;
    };

    function checkX(cellsToX, cell) {
        if (props.shots) {
            for (let i = 0; i < cellsToX.length; i++) {
                if ((cell[0] === cellsToX[i].row) && (cell[1] === cellsToX[i].col)) {
                    return true;
                }
            }
            
        }
        return false;
    };

    return (
        <div className="BoardNumbered">
            <div className='numberedColumnStyle'>
                {boardDimension.map(col => <p>{col+1}</p>)}
            </div>
            <div className="boardStyle">
                <ul className="board_rows">
                    {boardDimension.map((row, rowInd) =>
                        <li key={rowInd} >
                            <ul className='columnStyle'>
                                <li className='row_name'>{alphabet[rowInd]}</li>
                                {boardDimension.map((column, colInd) =>
                                    <li key={colInd} >
                                        <div onClick={() => {if (props.clicked)  {props.getIndexesData([(rowInd+1), (colInd+1)])}} } className={checkSubset(coloredCells, [(rowInd+1), (colInd+1)]) ? 'color' : 'noColor'}>
                                            {checkX(props.shots, [(rowInd+1), (colInd+1)]) ? <CloseIcon style={{color: 'red'}} className='Xcell'/> : ''}
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default BoardGame;