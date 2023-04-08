import express from 'express';
import dotenv from 'dotenv';
import database from './config/database.js';
import messaggingRouter from './routes/messagging.js';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();
database.connect();

const app = express();
const PORT = process.env.PORT || 4003;
app.use(express.json());

const server = new WebSocketServer({ port: 4005 });
const clients = new Map();
app.get('/connect', (req, res) => {

    const client = new WebSocket(req, {server});
    const userId = req.query.userId ?? new URLSearchParams(req.url.slice(1)).get('userId');
    console.log('client connected: '+userId);
    clients.set(userId, client);

    client.on('message', (messageData, isBinary) => {
        const {from, to, content} = JSON.parse(messageData);
        sendMessage({from, to, content}).then((response) => {
            console.log(`message from ${response.from} to ${response.to} at ${response.sendAt}: ${response.content}`);
            broadcast(response, isBinary);
        }).catch((error) => {
            console.log(error);
        })
    })

    client.on("close", () => {
        clients.delete(userId);
    })
})
 
app.use('/', messaggingRouter);

app.listen(PORT, (error) => {
    if(error){
        console.log(`Server connection failed at port: ${PORT}!`);
    } else {
        console.log(`Messages server running at port: ${PORT}`);
    }
})