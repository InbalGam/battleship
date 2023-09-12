import {  Outlet, NavLink } from "react-router-dom";
import AppBar from './AppBar';


function Root() {
    return (
        <div>
            <AppBar />
            <Outlet />
        </div>
    );

};

export default Root;