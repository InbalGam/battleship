import BoardGame from './BoardGame';


function ShipsPlacement(props) {

    return (
        <div>
            <BoardGame dimension={props.dimension} />
        </div>
    );
};

export default ShipsPlacement;