import styles from './Styles/BoardGame.css';


function BoardGame(props) {
    const boardDimension = Array.from(Array(props.dimension).keys());
    const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

    const divStyle = {
        width: '5rem',
        height: '5rem',
        border: '1px solid black',
    };

    const columnStyle = {
        display: 'flex'
    };

    const numberedColumnStyle = {
        marginLeft: '5rem',
        display: 'flex',
        gap: '4.5rem',
        justifyContent: 'center',
        position: 'relative',
        bottom: '10rem',
        fontWeight: 'bold'
    };

    const numberedRowStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        marginLeft: '6rem',
        position: 'relative',
        bottom: '9rem',
        fontWeight: 'bold'
    };

    const boardStyle = {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        bottom: '60rem'
    };

    function indexes(rowInd, colInd) {
        console.log([rowInd, colInd]);
        console.log([(rowInd+1), (colInd+1)]);
    };

    const checkSubset = (parentArray, subsetArray) => {
        for (let i = 0; i < parentArray.length; i++) {
            if ((parentArray[i][0] === subsetArray[0]) && (parentArray[i][1] === subsetArray[1])) {
                return true;
            }
        };
        return false;
    };

    return (
        <div className="BoardNumbered">
            <div style={numberedColumnStyle}>
                {boardDimension.map(col => <p>{col+1}</p>)}
            </div>
            <div style={numberedRowStyle}>
                {boardDimension.map(col => <p>{alphabet[col]}</p>)}
            </div>
            <div className="BoardGame" style={boardStyle}>
                <ul className="board_rows">
                    {boardDimension.map((row, rowInd) =>
                        <li key={rowInd} >
                            <ul className="board_columns" style={columnStyle}>
                                {boardDimension.map((column, colInd) =>
                                    <li key={colInd} >
                                        <div style={divStyle} onClick={() => indexes(row, column)} className={checkSubset(props.coloredCells, [(rowInd+1), (colInd+1)]) ? 'color' : 'noColor'}></div>
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