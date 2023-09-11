function BoardGame() {
    // example dimension 10
    const boardDimension = Array.from(Array(10).keys());

    function clickRowHandler(index) {
        console.log(index);
    };

    function clickColumnHandler(index) {
        console.log(index);
    };

    const divStyle = {
        width: '4rem',
        height: '4rem',
        border: '1px solid black'
    };

    const columnStyle = {
        display: 'flex'
    }

    return (
        <div className="BoardGame">
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
    );
};

export default BoardGame;