import ws, { WebSocketServer } from 'ws';
import http from 'http';
import express from 'express';

export const messagingWebSocketService = () => {
    try {
        const clients = new Map();
        const wss = new WebSocketServer({server});

        wss.on('connection', (client, req) => {
            const userId = req.query.userId;
            clients.set(userId, client);
            client.on('message', ({from, to, message}, isBinary) => {
                broadcast({from, to, message}, isBinary);
            })
            client.on('close', () => {
                clients.delete(userId);
            })
        })

        function broadcast({from, to, message}, isBinary) {
            const sender = clients.get(from);
            const reciever = clients.get(to);
            if(sender && sender.readyState === WebSocket.OPEN){
                sender.send({from, to, message},{ binary: isBinary});
            }
            if(reciever && reciever.readyState === WebSocket.OPEN){
                reciever.send({from, to, message}, { binary: isBinary});
            }
        }
    } catch (error) {
        console.log(error);
    }
}