import Messages from '../model/messageSchema.js'
import jwt from 'jsonwebtoken';

export const sendMessage = (messageData) => {
    const { from, to, content, mood } = messageData;
    console.log(mood);
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
            const data = await Messages.create({
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

export const getMessages = ({from, to, markSeen}) => {
    return new Promise(async (resolve, reject) => {
        const fromUserId = from;
        const toUserId = to;
        const { viewedUser, sentUser } = markSeen;
        if(!(fromUserId && toUserId)){
            reject({message: "Both from and to is required"});
        }
        try {
            await Messages.updateMany({
                "from._id": sentUser,
                "to._id": viewedUser,
                "seen": false
            },{
                $set: {
                    seen: true
                }
            }).then(async () => {
                await Messages.aggregate([
                    {
                        $match: {
                            $or: [{
                                "from._id": fromUserId,
                                "to._id": toUserId,
                                deletedUsers: {
                                    $nin: [viewedUser]
                                }
                            },{
                                "from._id": toUserId,
                                "to._id": fromUserId,
                                deletedUsers: {
                                    $nin: [viewedUser]
                                }
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
            }).catch((error) => {
                reject({message: "Database error occured while updating!", error});
            })
        } catch (error) {
            reject({message: "Internal error occured!", error});
        }
    })
}

export const getOverallMessages = async (userId) => {
    return new Promise(async (resolve, reject) => {
        if(!userId){
            reject({message: "User id is required!"});
        }
        try {
            await Messages.aggregate([
                {
                    $match: {
                        $or: [{
                            "from._id": userId,
                            deletedUsers: {
                                $nin: [userId]
                            }
                        },{
                            "to._id": userId,
                            deletedUsers: {
                                $nin: [userId]
                            }
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
                        isNewMessage: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $eq: [
                                                "$to._id",
                                                userId
                                            ]
                                        },{
                                            $eq: [
                                                "$seen",
                                                false
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
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
                        },
                        newMessageCount: {
                            $sum: "$isNewMessage"
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

export const doMarkSeen = ({viewedUser, sentUser}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!(viewedUser && sentUser)){
                reject({message: "Viewed and sent users are required!"});
                return;
            }
            await Messages.updateMany({
                "from._id": sentUser,
                "to._id": viewedUser,
                "seen": false
            },{
                $set: {
                    seen: true
                }
            }).then(async () => {
                await Messages.aggregate([
                    {
                        $match: {
                            $or: [{
                                "from._id": viewedUser,
                                "to._id": sentUser,
                                deletedUsers: {
                                    $nin: [sentUser]
                                }
                            },{
                                "from._id": sentUser,
                                "to._id": viewedUser,
                                deletedUsers: {
                                    $nin: [sentUser]
                                }
                            }]
                        }
                    }, {
                        $sort: {
                            sendAt: 1
                        }
                    }
                ]).then((messagesData) => {
                    console.log(messagesData);
                    resolve(messagesData);
                }).catch((error) => {
                    reject({message: "Database error occured!", error})
                }); 
            }).catch((error) => {
                console.log(error);
                reject({message: "Database error at doMarkSeen!"});
            })
        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured at doMarkSeen!"});
        }
    }) 
}

export const verifyUserService = (cookie) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!cookie){
                reject(false);
                return;
            }
            function cookieToObject(cookieStr) {
                const cookieArr = cookieStr.split("; ");
                const cookieObj = {};
              
                cookieArr.forEach((pair) => {
                  const [key, value] = pair.split("=");
                  cookieObj[key] = value;
                });
              
                return cookieObj;
            }
            let cookieAsObject = cookieToObject(cookie);
            const token = cookieAsObject["aein-app-jwtToken"];
            if(!token){
                reject(false);
                return;
            }
            jwt.verify(token, process.env.TOKEN_KEY, async (error, data) => {
                if(error) {
                    reject(false);
                } else {
                    resolve(data?.userId);
                }
            });
        } catch (error) {
            console.log(error);
            reject(false);
        }
    })
}

export const deleteMessages = ({messages, userId}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!messages){
                reject({message: "List of messages is missing!"});
                return;
            }
            messages.map((message) => Object(message));
            await Messages.updateMany({
                _id: {
                    $in: messages
                }
            },{
                $push: {
                    deletedUsers: userId
                }
            }).then(() => {
                resolve(true)
            }).catch((error) => {
                reject({message: "Database error occured!"})
            })
        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured!"});
        }
    })
}