function BoardGame(props) {
    const boardDimension = Array.from(Array(props.dimension).keys());
    const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

    function clickRowHandler(index) {
        console.log(index);
    };

    function clickColumnHandler(index) {
        console.log(index);
    };

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
        marginLeft: '53rem',
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

    return (
        <div className="BoardNumbered">
            <div style={numberedColumnStyle}>
                {boardDimension.map(col => <p>{col}</p>)}
            </div>
            <div style={numberedRowStyle}>
                {boardDimension.map(col => <p>{alphabet[col]}</p>)}
            </div>
            <div className="BoardGame" style={boardStyle}>
                <ul className="board_rows">
                    {boardDimension.map((row, ind) =>
                        <li key={ind} onClick={() => clickRowHandler(row)}>
                            <ul className="board_columns" style={columnStyle}>
                                {boardDimension.map((column, ind) =>
                                    <li key={ind} onClick={() => clickColumnHandler(column)}>
                                        <div className="gameDiv" style={divStyle}></div>
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