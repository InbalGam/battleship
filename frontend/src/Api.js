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

async function getProfile() {
    const url = `${baseURL}/profile`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return response;
};

async function updateNickname(nickname) {
    const url = `${baseURL}/profile`;
    const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nickname})
    });

    return response.status === 200;
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


async function getGameInfo(gameId) {
    const url = `${baseURL}/games/${gameId}`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return response;
};

async function readyToPlay(gameId) {
    const url = `${baseURL}/games/${gameId}/ready`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
    });

    return response.status === 200;
};

async function deleteAShip(gameId, shipData) {
    const url = `${baseURL}/games/${gameId}/place`;
    const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(shipData)
    });

    return response.status === 200;
};

async function placeAShip(gameId, shipData) {
    const url = `${baseURL}/games/${gameId}/place`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(shipData)
    });

    return response;//.status === 200;
};

export {login, register, logout, getProfile, updateNickname,
        getGames, acceptGame, deleteAGame, createNewGame, getGameInfo, readyToPlay, deleteAShip, placeAShip};