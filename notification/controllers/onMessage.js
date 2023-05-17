import broadcast from "./broadcast.js";
import eventHandler from "./eventHandler.js";

const onMessage = (verifiedId, clients) => {
    return async (datas) => {
        const { data, type } = JSON.parse(datas);
        const event = eventHandler(type);
        if(event){
            event({...data, verifiedId}).then((response) => {
                broadcast({...response, clients, type})
            }).catch((error) => {
                broadcast({...error, clients, type})
            })
        }
    }
}



export default onMessage;