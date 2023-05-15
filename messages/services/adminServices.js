import mongoose from "mongoose";
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

export const moodsDetailsService = () => {
    return new Promise((resolve, reject) => {
        try {
            Mood.aggregate([
                {
                    $lookup: {
                        from: 'messages',
                        localField: '_id',
                        foreignField: 'mood',
                        as: "moodCount"
                    }
                },{
                    $project: {
                        _id: 1,
                        color: 1,
                        createdAt: 1,
                        status: 1,
                        name: 1,
                        count: {
                            $size: "$moodCount"
                        }
                    }
                }
            ]).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject("Database error at moodsDetailsService!")
            })
        } catch (error) {
            reject("Internal error at moodsDetailsService!");
        }
    })
}

export const moodDetailsService = ({id}) => {
    return new Promise((resolve, reject) => {
        try {
            Mood.findOne({_id: new mongoose.Types.ObjectId(id)}).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject("Database error at moodsDetailsService!")
            })
        } catch (error) {
            reject("Internal error at moodsDetailsService!");
        }
    })
}

export const removeMoodService = ({id}) => {
    return new Promise((resolve, reject) => {
        try {
            id = new mongoose.Types.ObjectId(id)
            Mood.updateOne({
                _id: id
            },{
                $set:{
                    status: false
                }
            }).then(() => {
                return Mood.findOne({_id: id})
            }).then((response) => {
                resolve(response)
            }).catch(() => {
                reject("Database error at removeMoodService")
            })
        } catch (error) {
            reject("Internal error at removeMoodService");
        }
    })
}

export const recallMoodService = ({id}) => {
    return new Promise((resolve, reject) => {
        try {
            id = new mongoose.Types.ObjectId(id)
            Mood.updateOne({
                _id: id
            },{
                $set:{
                    status: true
                }
            }).then(() => {
                return Mood.findOne({_id: id})
            }).then((response) => {
                resolve(response)
            }).catch(() => {
                reject("Database error at recallMoodService")
            })
        } catch (error) {
            reject("Internal error at recallMoodService");
        }
    })
}

export const editMoodService = ({name, color, id}) => {
    return new Promise(async (resolve, reject) => {
        try {
            id = new mongoose.Types.ObjectId(id)
            let nameExist = await Mood.findOne({
                name,
                _id: {
                    $ne: id
                }
            });
            let colorExist = await Mood.findOne({
                color,
                _id: {
                    $ne: id
                }
            });
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
            Mood.updateOne({
                _id: id
            },{
                $set: {
                    name,
                    color
                }
            }).then((response) => {
                return Mood.findOne({
                    _id: id
                })
            }).then((response) => {
                resolve(response)
            }).catch((error) => {
                return reject("Database error at addMood Service")
            })
        } catch (error) {
            return reject("Internal error at addMoodService!")
        }
    })
}
