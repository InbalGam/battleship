import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { getGames } from "../Api";

function Home() {
    const navigate = useNavigate();

    async function getUserGames() {
        try {
            const result = await getGames();
            if (result.status === 200) {
                navigate('/games');
            } else if (result.status === 401) {
                navigate('/login');
            }
        } catch (e) {
            navigate('/error');
        }
    };

    useEffect(() => {
        getUserGames();
    },[]);

    return (
        <CircularProgress size={150} className='loader' />
    );
};

export default Home;