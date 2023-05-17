import mongoose from "mongoose"
import Notification from "../model/notificationSchema.js";

export const getNotifications = ({ verifiedId, to }) => {
    return new Promise ((resolve, reject) => {
        try {
            Notification.find({
                to: new mongoose.Types.ObjectId(verifiedId),
                status: true
            })
            .sort({at: -1})
            .then((response) => {
                resolve({data: response, from: verifiedId, to})
            }).catch((error) => {
                reject({error: "Database error: getNotifications ", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: getNotifications", from: verifiedId})
        }
    })
}

export const getNotificationsCount = ({ verifiedId, to }) => {
    return new Promise ((resolve, reject) => {
        try {
            Notification.find({
                to: new mongoose.Types.ObjectId(verifiedId),
                seen: false,
                status: true
            }).count().then((response) => {
                resolve({data: response, from: verifiedId, to});
            }).catch((error) => {
                reject({ error: "Database error: getNotificationsCount ", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: getNotificationsCount", from: verifiedId})
        }
    })
}

export const seenNotifications = ({verifiedId}) => {
    return new Promise ((resolve, reject) => {
        try {
            Notification.updateMany({
                to: new mongoose.Types.ObjectId(verifiedId)
            },{
                $set: {
                    seen: true
                }
            }).then(() => {
                resolve(true)
            }).catch((error) => {
                reject("Database error: seenNotifications")
            })
        } catch (error) { 
            reject("Internal error: seenNotifications")
        }
    })
}

export const follow = ({ verifiedId, to }) => {
    return new Promise (async (resolve, reject) => {
        try {
            await Notification.updateMany({
                type: "FOLLOW",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
            },{
                $set: {
                    status: false
                }
            }).catch((error) => {
                reject({error: "Database error: followService", from: verifiedId})
            })
            Notification.create({
                type: "FOLLOW",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                at: new Date()
            }).then((response) => {
                resolve({data: response, to})
            }).catch((error) => {
                reject({error: "Database error: followService", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: follow", from: verifiedId})
        }
    })
}

export const unfollow = ({ verifiedId, to }) => {
    return new Promise ((resolve, reject) => {
        try {
            Notification.updateMany({
                type: "FOLLOW",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to)
            },{
                $set: {
                    status: false
                }
            }).then((res) => {
                resolve({data: true, to})
            }).catch(() => {
                reject({error: "Internal error: unfollow", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: unfollow", from: verifiedId})
        }
    })
}

export const like = ({ verifiedId, to, on }) => {
    return new Promise (async (resolve, reject) => {
        try {
            await Notification.updateMany({
                type: "LIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on)
            },{
                $set: {
                    status: false
                }
            }).catch((error) => {
                reject({error: "Database error: like", from: verifiedId})
            })
            await Notification.updateMany({
                type: "DISLIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on)
            },{
                $set: {
                    status: false
                }
            }).catch((error) => {
                reject({error: "Database error: like", from: verifiedId})
            })
            Notification.create({
                type: "LIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on),
                at: new Date()
            }).then((response) => {
                resolve({data: response, to})
            }).catch((error) => {
                reject({error: "Database error: like", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: like", to })
        }
    })
}

export const unlike = ({ verifiedId, to, on }) => {
    return new Promise ((resolve, reject) => {
        try {
            Notification.updateMany({
                type: "LIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on)
            },{
                $set: {
                    status: false
                }
            }).then((res) => {
                resolve({data: true, to})
            }).catch(() => {
                reject({error: "Internal error: unlike", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: unlike", from: verifiedId})
        }
    })
}


export const dislike = ({ verifiedId, to, on }) => {
    return new Promise (async (resolve, reject) => {
        try {
            await Notification.updateMany({
                type: "DISLIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on)
            },{
                $set: {
                    status: false
                }
            }).catch((error) => {
                reject({error: "Database error: dislike", from: verifiedId})
            })
            await Notification.updateMany({
                type: "LIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on)
            },{
                $set: {
                    status: false
                }
            }).catch((error) => {
                reject({error: "Database error: dislike", from: verifiedId})
            })
            Notification.create({
                type: "DISLIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on),
                at: new Date()
            }).then((response) => {
                resolve({data: response, to})
            }).catch((error) => {
                reject({error: "Database error: dislike", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: dislike", to })
        }
    })
}

export const undislike = ({ verifiedId, to, on }) => {
    return new Promise ((resolve, reject) => {
        try {
            Notification.updateMany({
                type: "DISLIKE",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on)
            },{
                $set: {
                    status: false
                }
            }).then((res) => {
                resolve({data: true, to})
            }).catch(() => {
                reject({error: "Internal error: undislike", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: undislike", from: verifiedId})
        }
    })
}

export const comment = ({ verifiedId, to, on }) => {
    return new Promise (async (resolve, reject) => {
        try {
            Notification.create({
                type: "COMMENT",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on),
                at: new Date()
            }).then((response) => {
                resolve({data: response, to})
            }).catch((error) => {
                reject({error: "Database error: comment", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: comment", to })
        }
    })
}


export const reply = ({ verifiedId, to, on }) => {
    return new Promise (async (resolve, reject) => {
        try {
            Notification.create({
                type: "REPLY",
                from: new mongoose.Types.ObjectId(verifiedId),
                to: new mongoose.Types.ObjectId(to),
                on: new mongoose.Types.ObjectId(on),
                at: new Date()
            }).then((response) => {
                resolve({data: response, to})
            }).catch((error) => {
                reject({error: "Database error: reply", from: verifiedId})
            })
        } catch (error) {
            reject({error: "Internal error: reply", to })
        }
    })
}