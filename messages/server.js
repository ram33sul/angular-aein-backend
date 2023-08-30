import { createServer } from 'http';
import express from 'express';
import ws, { WebSocketServer } from 'ws';
import { deleteMessages, doMarkSeen, getMessages, getMoods, getOverallMessages, sendMessage, shareService, verifyUserService } from './controllers/messagesControllers.js';
import dotenv from 'dotenv';
import database from './config/database.js';
import { addMood, editMood, messagesCountDetails, moodDetails, moodsDetails, recallMood, removeMood} from './controllers/adminControllers.js';


dotenv.config();
database.connect();


const server = createServer(express);

const wss = new WebSocketServer({server});
const clients = new Map();

const chattingClients = new Map();

wss.on('connection',async (client, req) => {

    let userId;
    await verifyUserService(req.headers.cookie, req.url.split('token=')[1]).then((response) => {
        userId = response;
    }).catch((error) => {
        console.log("User cannot be verified!");
    });

    if(!userId){
        return;
    }

    // const userId = new URLSearchParams(req.url.slice(1)).get('userId');
    clients.set(userId, client);

    if(chattingClients.get(userId)){
        broadcast({ isOnline: true, type: "isOnline"}, chattingClients.get(userId).isBinary, {to: chattingClients.get(userId).userIdWhoIsChecking})
    }

    client.on('message', (messageData, isBinary) => {
        messageData = JSON.parse(messageData);
        const type = messageData.type;

        if(type === 'sendMessage'){
            const {from, to, content, mood} = messageData;
            console.log("send")
            sendMessage({from, to, content, mood}).then((response) => {
                broadcast({data: response, type: "sendMessage"}, isBinary, {from: response.from.toString(), to: response.to.toString()});
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'getMessages'){
            const { from, to, markSeen } = messageData;
            getMessages({from, to, markSeen}).then((response) => {
                broadcast({messageData: response, type: "getMessages"}, isBinary, {from});
                doMarkSeen({viewedUser: from, sentUser: to}).then((response) => {
                    broadcast({messageData: response, type: "markSeen"}, isBinary, {to});
                })
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
        } else if (type === 'deleteMessages'){
            const { messages, userId } = messageData;
            deleteMessages({messages, userId}).then(() => {
                broadcast({status: true, type: 'deleteMessages'}, isBinary, {to: userId})
            }).catch((error) =>{
                console.log(error);
            })
        } else if (type === 'markSeen'){
            const { viewedUser, sentUser } = messageData;
            doMarkSeen({viewedUser, sentUser}).then((response) => {
                broadcast({ messageData: response, type}, isBinary, {to: sentUser});
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'share'){
            shareService(messageData).then((response) => {
                broadcast({ messageData: response, type}, isBinary, {from: messageData.userId, to: messageData.toUserId})
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'getMoods'){
            getMoods().then((response) => {
                broadcast({ messageData: response, type}, isBinary, { to: messageData.userId})
            }).catch((error) => {
                console.log(error);
            })
        } else if (type === 'messagesCountDetails' && userId === 'admin'){
            messagesCountDetails().then((response) => {
                broadcast({ messageData: {...response, onlineUsers: clients.size}, type}, isBinary, { to: 'admin'})
            }).catch((error) => {
                broadcast({ error: error, type}, isBinary, { to: 'admin'})
            })
        } else if (type === 'addMood' && userId === 'admin'){
            addMood(messageData?.messageData).then((response) => {
                broadcast({messageData: response, type}, isBinary, { to: 'admin' })
            }).catch((error) => {
                broadcast({ error: error, type}, isBinary, { to: 'admin'})
            })
        } else if (type === 'moodsDetails' && userId === 'admin'){
            moodsDetails().then((response) => {
                broadcast({messageData: response, type}, isBinary, { to: 'admin'})
            }).catch((error) => {
                broadcast({ error: error, type}, isBinary, { to: 'admin'})
            })
        } else if (type === 'moodDetails' && userId === 'admin'){
            moodDetails(messageData?.messageData).then((response) => {
                broadcast({messageData: response, type}, isBinary, {to: 'admin'})
            }).catch((error) => {
                broadcast({error: error, type}, isBinary, {to: 'admin'})
            })
        } else if (type === 'removeMood' && userId === 'admin'){
            removeMood(messageData?.messageData).then((response) => {
                broadcast({messageData: response, type}, isBinary, {to: 'admin'})
            }).catch((error) => {
                broadcast({error: error, type}, isBinary, {to: 'admin'})
            })
        } else if (type === 'recallMood' && userId === 'admin'){
            recallMood(messageData?.messageData).then((response) => {
                broadcast({messageData: response, type}, isBinary, {to: 'admin'})
            }).catch((error) => {
                broadcast({error: error, type}, isBinary, {to: 'admin'})
            })
        } else if (type === 'editMood' && userId === 'admin'){
            editMood(messageData?.messageData).then((response) => {
                broadcast({messageData: response, type}, isBinary, {to: 'admin'})
            }).catch((error) => {
                broadcast({error: error, type}, isBinary, {to: 'admin'})
            })
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