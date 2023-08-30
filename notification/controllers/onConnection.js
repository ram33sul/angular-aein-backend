import auth from "../authentication/auth.js";
import onClose from "./onClose.js";
import onMessage from "./onMessage.js";
import onError from './onError.js'

const onConnection = (clients) => {
    return async (client, req) => {
        const userId = await auth(req.headers.cookie, req.url?.split?.('token=')?.[1]).catch(() => {
            client.close();
        })
        if(!userId){
            return;
        }
        clients.set(userId, client)
        client.on("message", onMessage(userId, clients));
        client.on("close", onClose(userId, clients));
        client.on("error", onError(userId, clients));
    }
}

export default onConnection;