import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { NavLink } from 'react-router-dom';


export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <NavLink to='/' className='navLinks'>Battleship</NavLink>
          </Typography>
          <Button color="inherit"><NavLink to='/profile' className='navLinks'>Profile</NavLink></Button>
          <Button color="inherit"><NavLink to='/logout' className='navLinks'>Logout</NavLink></Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
