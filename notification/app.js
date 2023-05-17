import { createServer } from 'http'
import express from 'express';
import dotenv from 'dotenv';
import { WebSocket, WebSocketServer } from 'ws'
import database from './config/database.js'
import onConnection from './controllers/onConnection.js';

dotenv.config();
database.connect();

const server = createServer(express);
const PORT = process.env.PORT;

const clients = new Map();

const wss = new WebSocketServer({server})

wss.on("connection", onConnection(clients));

server.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})