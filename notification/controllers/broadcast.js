import ws from 'ws'

function broadcast({data, from, to, clients, type}) {
    const sender = clients.get(from);
    const reciever = clients.get(to);
    if(sender && sender.readyState === ws.OPEN){
        sender.send(JSON.stringify({data, type}),{ binary: false});
    }
    if(reciever && reciever.readyState === ws.OPEN){
        reciever.send(JSON.stringify({data, type}), { binary: false});
    }
}

export default broadcast;