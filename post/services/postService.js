import mongoose from 'mongoose';
import Post from '../model/postSchema.js'
import { validatePost } from '../../user/validation/validate.js';
import axios from 'axios';

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


export const doGetPosts = ({userId, token}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!userId){
                return reject([{message: "UserId is required!"}])
            }
            axios.get(`${process.env.USER_SERVICE}/followingList?userId=${userId}`,{
                headers: {
                    "aein-app-jwtToken": token
                }
            }).then((response) =>{
                const followingList = response.data.map((id) => {
                    return new mongoose.Types.ObjectId(id);
                })
                userId = new mongoose.Types.ObjectId(userId)
                Post.aggregate([
                    {
                        $match: {
                            userId: {
                                $in: followingList
                            }
                        }
                    },{
                        $sort: {
                            postedAt: -1
                        }
                    }
                ]).then((response) => {
                    resolve(response)
                }).catch((error) => {
                    reject([{message: "Database error occured at doGetPosts!"}])
                })
            }).catch((error) => {
                reject([{message: "Server error occured at doGetPosts!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at doGetPosts!"}]);
        }
    })
}

export const explorePostsService = ({userId, token}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!userId){ 
                return reject([{message: "UserId is required!"}])
            }
            axios.get(`${process.env.USER_SERVICE}/blockedUsersList?userId=${userId}`,{
                headers: {
                    "aein-app-jwtToken": token
                }
            }).then((response) => {
                const blockedUsersList = response.data.map((res) => {
                    return new mongoose.Types.ObjectId(res._id);
                })
                axios.get(`${process.env.USER_SERVICE}/followingList?userId=${userId}`, {
                    headers: {
                        "aein-app-jwtToken": token
                    }
                }).then((response) => {
                    const followingList = response.data.map((id) => {
                        return new mongoose.Types.ObjectId(id);
                    })
                    Post.find({
                        userId: {
                            $nin: [...blockedUsersList,...followingList,new mongoose.Types.ObjectId(userId)]
                        }
                    }).then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject([{message: "Database error at explorePostsService!"}])
                    })
                }).catch((error) => {
                    reject([{message: "Server error at explorePostsService (2)!"}])
                })
            }).catch((error) => {
                console.log(error);
                reject([{message: "Server error at explorePostsService (1)!"}])
            })
        } catch (error){
            reject([{message: "Internal error at explorePostsService!"}])
        }
    })
}

export const postsByUser = ({userId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!userId){
                return reject([{message: "UserId is required!"}])
            }
            userId = new mongoose.Types.ObjectId(userId);
            Post.find({
                userId
            }).sort({
                postedAt: -1
            }).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject([{message: "Database error at postsByUser!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at postsByUser!"}])
        }
    })
}

export const likePostService = ({userId, postId}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let error = []
            if(!userId){
                error[error.length] = {field: "userId", message: "userId is required!"}
            }
            if(!postId){
                error[error.length] = {field: "postId", message: "postId is required!"}
            }
            if(error.length){
                return reject(error)
            }
            postId = new mongoose.Types.ObjectId(postId);
            userId = new mongoose.Types.ObjectId(userId);
            Post.updateOne({
                _id: postId
            },{
                $addToSet: {
                    likes: userId
                }
            }).then(() => {
                return Post.findOne({
                    _id: postId
                })
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject([{message: "Database error at likePostService!"}]);
            })
        } catch (error) {
            reject([{message: "Internal error at likePostService!"}])
        }
    })
}

export const unlikePostService = ({userId, postId}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let error = []
            if(!userId){
                error[error.length] = {field: "userId", message: "userId is required!"}
            }
            if(!postId){
                error[error.length] = {field: "postId", message: "postId is required!"}
            }
            if(error.length){
                return reject(error)
            }
            postId = new mongoose.Types.ObjectId(postId);
            userId = new mongoose.Types.ObjectId(userId);
            Post.updateOne({
                _id: postId
            },{
                $pull: {
                    likes: userId
                }
            }).then(() => {
                return Post.findOne({
                    _id: postId
                })
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject([{message: "Database error at unlikePostService!"}]);
            })
        } catch (error) {
            reject([{message: "Internal error at unlikePostService!"}])
        }
    })
}