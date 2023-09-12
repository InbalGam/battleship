import fetch from 'cross-fetch';
import {baseURL} from './apiKey';

// Authorization
async function login(username, password) {
    const url = `${baseURL}/login`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });

    return response.status === 200;
};

async function register(username, password, nickname) {
    const url = `${baseURL}/register`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password, nickname})
    });

    return response.status === 200;
};

async function logout() {
    const url = `${baseURL}/logout`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return response;
};

// Game
async function getGames() {
    const url = `${baseURL}/games`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return response;
};


async function acceptGame(gameId) {
    const url = `${baseURL}/games/${gameId}`;
    const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
    });

    return response.status === 200;
};


async function deleteAGame(gameId) {
    const url = `${baseURL}/games/${gameId}`;
    const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
    });

    return response.status === 200;
};

async function createNewGame(gameInfo) {
    const url = `${baseURL}/games`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(gameInfo)
    });

    return response.status === 201;
};

export {login, register, logout,
        getGames, acceptGame, deleteAGame, createNewGame};