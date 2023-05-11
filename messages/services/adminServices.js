import Messages from "../model/messageSchema.js"
import Mood from "../model/moodSchema.js";

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

export const addMoodService = ({name, color}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let nameExist = await Mood.findOne({name});
            let colorExist = await Mood.findOne({color});
            nameExist = nameExist?.name
            colorExist = colorExist?.name
            let error = [];
            if(nameExist){
                error[error.length] = {field: "name", message: "Name already exists"}
            }
            if(colorExist){
                error[error.length] = {field: "color", message: "Color already exists"}
            }
            if(error.length){
                return reject(error)
            }
            Mood.create({
                name,
                color,
                createdAt: new Date()
            }).then((response) => {
                return resolve(response)
            }).catch((error) => {
                return reject("Database error at addMood Service")
            })
        } catch (error) {
            return reject("Internal error at addMoodService!")
        }
    })
}