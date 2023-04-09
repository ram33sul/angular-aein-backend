import { createServer } from 'http';
import express from 'express';
import ws, { WebSocketServer } from 'ws';
import { doMarkSeen, getMessages, getOverallMessages, sendMessage } from './controllers/messagesControllers.js';
import dotenv from 'dotenv';
import database from './config/database.js';
import messages from './model/messageSchema.js';
dotenv.config();
database.connect();


const server = createServer(express);

const wss = new WebSocketServer({server});
const clients = new Map();

const chattingClients = new Map();

wss.on('connection', (client, req) => {

    const userId = new URLSearchParams(req.url.slice(1)).get('userId');
    clients.set(userId, client);

    if(chattingClients.get(userId)){
        broadcast({ isOnline: true, type: "isOnline"}, chattingClients.get(userId).isBinary, {to: chattingClients.get(userId).userIdWhoIsChecking})
    }

    client.on('message', (messageData, isBinary) => {
        messageData = JSON.parse(messageData);
        const type = messageData.type;

        if(type === 'sendMessage'){
            const {from, to, content} = messageData;
            sendMessage({from, to, content}).then((response) => {
                broadcast({data: response, type: "sendMessage"}, isBinary, {from: response.from._id, to: response.to._id});
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'getMessages'){
            const { from, to} = messageData;
            getMessages({from, to}).then((response) => {
                broadcast({messageData: response, type: "getMessages"}, isBinary, {from, to});
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'getOverallMessages'){
            const { userId } = messageData;
            getOverallMessages(userId).then((response) => {
                broadcast({ data: response, type: "getOverallMessages"}, isBinary, {from: userId})
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'markSeen'){
            const { viewedUser, sentUser } = messageData;
            doMarkSeen({viewedUser, sentUser}).then(() => {
                broadcast({ type: "markSeen"}, isBinary, {to: sentUser});
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'isOnline'){
            const { userIdToBeChecked, userIdWhoIsChecking } = messageData;
            if(!(userIdToBeChecked && userIdWhoIsChecking)){
                console.log("Both userId are required!");
                return;
            }
            chattingClients.set(userIdToBeChecked, {userIdWhoIsChecking, isBinary});
            let isOnline;
            if(clients.get(userIdToBeChecked)){
                isOnline = true;
            } else {
                isOnline = false
            }
            broadcast({ isOnline, type: "isOnline"}, isBinary, {to: userIdWhoIsChecking});
        }
    })

    client.on("close", () => {
        if(chattingClients.get(userId)){
            broadcast({ isOnline: false, type: "isOnline"}, chattingClients.get(userId).isBinary, {to: chattingClients.get(userId).userIdWhoIsChecking})
        }
        clients.delete(userId);
    })
})

function broadcast(messageData, isBinary, {from, to}) {
    const sender = clients.get(from);
    const reciever = clients.get(to);
    if(sender && sender.readyState === ws.OPEN){
        sender.send(JSON.stringify(messageData),{ binary: isBinary});
    }
    if(reciever && reciever.readyState === ws.OPEN){
        reciever.send(JSON.stringify(messageData), { binary: isBinary});
    }
}

server.listen(5001, () => {
    console.log("server connected at port: 5001");
})