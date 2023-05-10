import Messages from "../model/messageSchema.js"

export const messagedUsersTodayCount = () => {
    return new Promise((resolve, reject) => {
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);
        Messages.aggregate([
            {
                $match: {
                    sendAt: {
                        $gt: start,
                        $lt: end
                    }
                }
            },{
                $group: {
                    _id: "$from"
                }
            },{
                $count: "count"
            }
        ]).then(response => {
            resolve(response[0]?.count ?? 0)
        }).catch((error) => {
            reject({message: "Database error at activeUsersToday!"})
        })
    })
}

export const totalMessagesService = () => {
    return new Promise((resolve, reject) => {
        Messages.find().count().then((response) => {
            resolve(response)
        }).catch((error) => {
            reject("Database error at totalMessagesCountService!")
        })
    })
}

export const totalMessagesTodayService = () => {
    return new Promise((resolve, reject) => {
        const start = new Date().setHours(0,0,0,0);
        const end = new Date().setHours(23,59,59,999);
        Messages.find({
            sendAt: {
                $gt: start,
                $lt: end
            }
        }).count().then((response) => {
            resolve(response);
        }).catch((error) => {
            reject("Database error at totalMessagesTodayService!")
        })
    })
} 