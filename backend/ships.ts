import * as db from './db';


// Vars
export const shipsAmount = {
    // ship size : amount of ships
    10: {
        5: 1,
        4: 1,
        3: 2,
        2: 1
    },
    20: {
        8: 1,
        7: 1,
        6: 2,
        5: 2,
        4: 3,
        3: 4
    }
};

export const totalShipsSizes = {
    10: 17,
    20: 61
}

export const shipAmountDimension = {
    10: 5,
    20: 13
}


export function checkShipPlacement(start_row: number, end_row: number, start_col: number, end_col: number, shipInDb: db.Ship): boolean {
    if (shipInDb.start_row === shipInDb.end_row) {
        if ((start_row === shipInDb.start_row && start_col === shipInDb.start_col) || (start_row === shipInDb.start_row && end_col === shipInDb.end_col)) {
            return true;
        }
        if ((start_row === shipInDb.start_row && start_col === (shipInDb.start_col - 1)) || (start_row === shipInDb.start_row && start_col === (shipInDb.end_col + 1))) {
            return true;
        }

        if (start_row === (shipInDb.start_row + 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.end_col + 1))){
            return true;
        }

        if (start_row === (shipInDb.start_row - 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.end_col + 1))){
            return true;
        }

        if (start_row < shipInDb.start_row && end_row > shipInDb.start_row && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.end_col + 1))) {
            return true;
        }

        if (((start_row === (shipInDb.start_row + 1)) || (start_row === (shipInDb.start_row - 1))) && (end_col >= (shipInDb.start_col - 1) && end_col <= (shipInDb.end_col + 1))) {
            return true;
        }
    } else if (shipInDb.start_row !== shipInDb.end_row) {
        if (start_row === shipInDb.start_row && start_col === shipInDb.start_col) {
            return true;
        }
        if (start_col === (shipInDb.start_col - 1) && (start_row === shipInDb.start_row || start_row === shipInDb.end_row)) {
            return true;
        }

        if (start_col === (shipInDb.start_col + 1) && (start_row === shipInDb.start_row || start_row === shipInDb.end_row)) {
            return true;
        }

        if (start_row === (shipInDb.start_row - 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.start_col + 1))) {
            return true;
        }

        if (start_row === (shipInDb.end_row + 1) && (start_col >= (shipInDb.start_col - 1) && start_col <= (shipInDb.start_col + 1))) {
            return true;
        }

        if (start_col < shipInDb.start_col && end_col > shipInDb.start_col && (start_row >= (shipInDb.start_row - 1) && start_row <= (shipInDb.end_row + 1))) {
            return true;
        }
    }
    return false;
};
