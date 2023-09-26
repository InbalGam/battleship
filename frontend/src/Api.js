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

    return response;
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

async function updateProfile(data) {
    const url = `${baseURL}/profile`;
    const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
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

    return response;
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

    return response;
};

async function performShot(gameId, shotData) {
    const url = `${baseURL}/games/${gameId}/shoot`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(shotData)
    });

    return response.status === 200;
};

// Chat

async function sendChatMsg(gameId, message) {
    const url = `${baseURL}/games/${gameId}/chat`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(message)
    });

    return response;
};


async function getChatMsgs(gameId) {
    const url = `${baseURL}/games/${gameId}/chat`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    return response;
};


async function loadImage(data) {
    const url = `${baseURL}/image`;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Accept': 'application/json'},
        body: data
    });

    return response;
};

export {login, register, logout, getProfile, updateProfile,
        getGames, acceptGame, deleteAGame, createNewGame, getGameInfo, readyToPlay, deleteAShip, placeAShip, performShot,
        sendChatMsg, getChatMsgs, loadImage};