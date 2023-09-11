import fetch from 'cross-fetch';
import {baseURL} from './apiKey';


// Game
async function getGames() {
    const url = `${baseURL}/games`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return response;
};

export {getGames};