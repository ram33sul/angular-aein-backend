import { ObjectId } from 'bson';
import messages from '../model/messageSchema.js'

export const sendMessage = (messageData) => {
    const { from, to, content } = messageData;
    let mood = messageData.mood ?? "no mood";
    return new Promise(async (resolve, reject) => {
        try {
            if(!(from && to && content)){
                reject({message: "Message data is not complete!"});
                return;
            }
            if(from._id === to._id){
                reject({message: "sender and reciever cannot be same!"});
                return;
            }
            const data = await messages.create({
                from,
                to,
                content,
                mood,
                sendAt: new Date()
            })
            resolve(data);
        } catch (error) {
            reject({message: "Internal error occured at sendMessage!"})
        }
    })
}

export const getMessages = ({from, to}) => {
    return new Promise(async (resolve, reject) => {
        const fromUserId = from;
        const toUserId = to;
        if(!(fromUserId && toUserId)){
            reject({message: "Both from and to is required"});
        }
        try {
            await messages.aggregate([
                {
                    $match: {
                        $or: [{
                            "from._id": fromUserId,
                            "to._id": toUserId
                        },{
                            "from._id": toUserId,
                            "to._id": fromUserId
                        }]
                    }
                }, {
                    $sort: {
                        sendAt: 1
                    }
                }
            ]).then((messagesData) => {
                resolve(messagesData);
            }).catch((error) => {
                reject({message: "Database error occured!", error})
            });
    
        } catch (error) {
            reject({messages: "Internal error occured!", error});
        }
    })
}

export const getOverallMessages = async (userId) => {
    return new Promise(async (resolve, reject) => {
        if(!userId){
            reject({message: "User id is required!"});
        }
        try {
            await messages.aggregate([
                {
                    $match: {
                        $or: [{
                            "from._id": userId
                        },{
                            "to._id": userId
                        }]
                    }
                }, {
                    $project: {
                        foreignId: {
                            $cond: [
                                {
                                    $eq: [
                                        "$from._id",
                                        userId
                                    ]
                                },
                                "$to._id",
                                "$from._id"
                            ]
                        },
                        content: 1,
                        mood: 1,
                        sendAt: 1,
                        seen: 1,
                        _id: 1,
                        to: 1,
                        from: 1,
                    }
                }, {
                    $sort: {
                        sendAt: -1
                    }
                }, {
                    $group: {
                        _id: {
                            foreignId: "$foreignId"
                        },
                        content: {
                            $first: "$content"
                        },
                        mood: {
                            $first: "$mood"
                        },
                        sendAt: {
                            $first: "$sendAt"
                        },
                        seen: {
                            $first: "$seen"
                        },
                        messageId: {
                            $first: "$_id"
                        },
                        to: {
                            $first: "$to"
                        },
                        from: {
                            $first: "$from"
                        }
                    }
                }, {
                    $sort: {
                        sendAt: -1
                    }
                }
            ]).then((messageData) => {
                resolve(messageData);
            }).catch((error) => {
                console.log(error);
                reject({message: "Database error occured!"});
            });

        } catch (error) {
            reject({message: "Internal error occured!", error});
        }
    })
}
