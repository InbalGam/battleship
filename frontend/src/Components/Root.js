import {  Outlet, NavLink } from "react-router-dom";
import GamesIcon from '@mui/icons-material/Games';


function Root() {
    return (
        <div>
            <div className='nav-bar'>
                <p><GamesIcon className="GameIcon"/> Battleship Game</p>
                <div className='nav-links'>
                    <NavLink to='/logout' className='logoutLink'>Log out</NavLink>
                </div>
            </div>
            <Outlet />
        </div>
    );

};

export default Root;