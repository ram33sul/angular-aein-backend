import mongoose from 'mongoose';
import Post from '../model/postSchema.js'
import { validatePost } from '../../user/validation/validate.js';

export const addPostService = ({messages, userId, withUserId, privacy}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let error = [];
            if(!messages || !messages.length){
                error[error.length] = {field: "messages", message: "Messages are required!"}
            }
            if(!userId){
                error[error.length] = {field: "userId", message: "UserId is required!"}
            }
            if(!privacy){
                error[error.length] = {field: "privacy", message: "Privacy settings are required!"}
            }
            if(error.length){
                reject(error);
                return;
            }
            const isPostValid = validatePost(messages);
            if(!isPostValid.status){
                reject([{field: "messages", message: isPostValid.message}]);
                return;
            }
            messages = messages.map((message) => {
                return new mongoose.Types.ObjectId(message._id)
            })
            await Post.create({
                userId: new mongoose.Types.ObjectId(userId),
                withUserId: new mongoose.Types.ObjectId(withUserId),
                messages,
                ...privacy,
                postedAt: new Date()
            }).then(() => {
                resolve(true)
            }).catch(() => {
                reject([{message: "Database errir occured at addPostService"}]);
            })
        } catch (error){
            reject([{message: 'Internal error occured at addPostService'}]);
        }
    })
}