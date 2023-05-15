import mongoose, { mongo } from 'mongoose';
import Post from '../model/postSchema.js'
import Comment from '../model/commentSchema.js';
import { validatePost } from '../../user/validation/validate.js';
import Reply from '../model/replySchema.js';
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
                },
                $pull: {
                    dislikes: userId
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

export const dislikePostService = ({userId, postId}) => {
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
                    dislikes: userId
                },
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
                reject([{message: "Database error at dislikePostService!"}]);
            })
        } catch (error) {
            reject([{message: "Internal error at dislikePostService!"}])
        }
    })
}

export const undislikePostService = ({userId, postId}) => {
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
                    dislikes: userId
                }
            }).then(() => {
                return Post.findOne({
                    _id: postId
                })
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject([{message: "Database error at undislikePostService!"}]);
            })
        } catch (error) {
            reject([{message: "Internal error at undislikePostService!"}])
        }
    })
}

export const postDetailsService = ({id}) => {
    return new Promise((resolve, reject) => {
        try {
            id = new mongoose.Types.ObjectId(id)
            Post.findOne({_id: id}).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject([{message: "Database error at postDetails!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at postDetailsService!"}])
        }
    })
}

export const getCommentsService = ({postId}) => {
    return new Promise((resolve, reject) => {
        try {
            postId = new mongoose.Types.ObjectId(postId)
            Comment.find({
                postId
            })
            .sort({
                at: 1
            })
            .then((response) => {
                resolve(response)
            }).catch((error) => {
                reject([{message: "Database error at getCommentsService!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at getCommentsService!"}])
        }
    })
}

export const postCommentService = ({content, userId, postId}) => {
    return new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            userId = new mongoose.Types.ObjectId(userId)
            postId = new mongoose.Types.ObjectId(postId)
            await Comment.create({
                userId,
                postId,
                content
            })
            await Post.updateOne({
                _id: postId
            },{
                $inc: {
                    commentsCount: 1
                }
            })
            await session.commitTransaction();
            getCommentsService({postId}).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject([{message: "Database error at postCommentService!"}]);
            })
        } catch (error) {
            session.abortTransaction()
            reject([{message: "Internal error at getCommentsService!"}])
        } finally {
            session.endSession();
        }
    })
}

export const sendReplyService = (replyData) => {
    return new Promise(async (resolve, reject) => {
        if(!replyData){
            reject([{message: "ReplyData is required!"}])
            return
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            replyData.userId = new mongoose.Types.ObjectId(replyData.userId);
            replyData.postId = new mongoose.Types.ObjectId(replyData.postId)
            await Reply.create(replyData).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject([{message: "Database error at sendReplyService!"}])
            })
            await Post.updateOne({
                _id: replyData.postId
            },{
                $inc: {
                    repliesCount: 1
                }
            })
            await session.commitTransaction();
        } catch (error) {
            session.abortTransaction()
            console.log(error);
            reject([{message: "Internal error at sendReplyService!"}])
        } finally {
            session.endSession();
        }
    })
}

export const getRepliesService = ({postId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!postId){
                reject([{message: "postId is required!"}])
            }
            postId = new mongoose.Types.ObjectId(postId);
            Reply.find({ postId }).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject([{message: "Database error at getRepliesService!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at getRepliesService!"}])
        }
    })
}

export const totalPostsCount = () => {
    return new Promise((resolve, reject) => {
        Post.find().count().then((response) => {
            resolve(response)
        }).catch((error) => {
            reject([{message: "Database error at totalPostsService!"}])
        })
    })
}

export const totalPostsCountToday = () => {
    return new Promise ((resolve, reject) => {
        var start = new Date();
        start.setHours(0,0,0,0);
        var end = new Date();
        end.setHours(23,59,59,999);
        Post.find({
            postedAt: {
                $gte: start,
                $lt: end
            }
        }).count().then((response) => {
            resolve(response)
        }).catch(() => {
            reject([{message: "Database error at totalPostsCountToday!"}])
        })
    })
}

export const postInteractionsCount = () => {
    return new Promise((resolve, reject) => {
        try {
            Post.aggregate([
                {
                    $project: {
                        likesCount: {
                            $size: "$likes"
                        },
                        dislikesCount: {
                            $size: "$dislikes"
                        },
                        commentsCount: 1,
                        repliesCount: 1,
                        sharesCount: 1
                    }
                },{
                    $group: {
                        _id: null,
                        likesCount: {
                            $sum: "$likesCount"
                        },
                        dislikesCount: {
                            $sum: "$dislikesCount"
                        },
                        commentsCount: {
                            $sum: "$commentsCount"
                        },
                        repliesCount: {
                            $sum: "$repliesCount"
                        },
                        sharesCount: {
                            $sum: "$sharesCount"
                        }
                    }
                }
            ]).then((response) => {
                resolve(response[0])
            }).catch((error) => {
                reject("Database error at postsInteractionsCount")
            })
        } catch (error) {
            reject("Internal error at postsInteractionsCount")
        }
    })
}


export const postsDataService = () => {
    try {
        return new Promise((resolve, reject) => {
            Post.find().sort({postedAt: -1}).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject("Database errror at postsDataService!")
            })
        })
    } catch (error) {
        reject("Internal error at postsDataService!")
    }
}