import { addPostService, dislikePostService, doGetPosts, explorePostsService, getCommentsService, getRepliesService, likePostService, postCommentService, postDetailsService, postsByUser, sendReplyService, undislikePostService, unlikePostService } from "../services/postService.js";

export const addPost = (req,res) => {
    try {
        addPostService({...req.body, userId: req.verifiedUser?._id}).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error);
        })
    } catch (error) {
        console.log("Internal error at addPost!");
        res.status(400).send([{message: "Internal error at addPost!"}])
    }
}

export const getPosts = (req,res) => {
    try {
        doGetPosts({...req.query, token: req.cookies["aein-app-jwtToken"]}).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error)
        })
    } catch (error) {
        console.log("Internal error at getPosts!");
        res.status(400).send([{message: "Internal error at getPosts!"}])
    }
}

export const getExplorePosts = (req,res) => {
    try {
        explorePostsService({...req.query, token: req.cookies["aein-app-jwtToken"]}).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error)
        })
    } catch (error) {
        console.log("Internal error at getExplorePosts!");
        res.status(400).send([{message: "Internal error at getExplorePosts!"}])
    }
}

export const getPostsByUser = (req,res) => {
    try {
        postsByUser(req.query).then((response) => {
            res.status(200).json(response)
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error)
        })
    } catch (error) {
        console.log("Internal error at getPostsByUser!");
        res.status(400).send([{message: "Internal error at getPostsByUser!"}])
    }
}

export const doLikePost = (req,res) => {
    try {
        likePostService(req.body).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error);
        })
    } catch (error) {
        console.log("Internal error at doLikePost!");
        res.status(400).send([{message: "Internal error at doLikePost!"}])
    }
}

export const doUnlikePost = (req,res) => {
    try {
        unlikePostService(req.body).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error);
            console.log(error);
        })
    } catch (error) {
        console.log("Internal error at doUnlikePost!");
        res.status(400).send([{message: "Internal error at doUnlikePost!"}])
    }
}


export const doDislikePost = (req,res) => {
    try {
        dislikePostService(req.body).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error);
        })
    } catch (error) {
        console.log("Internal error at doDislikePost!");
        res.status(400).send([{message: "Internal error at doDislikePost!"}])
    }
}

export const doUndislikePost = (req,res) => {
    try {
        undislikePostService(req.body).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error);
            console.log(error);
        })
    } catch (error) {
        console.log("Internal error at doUndislikePost!");
        res.status(400).send([{message: "Internal error at doUndislikePost!"}])
    }
}

export const getPostDetails = (req, res) => {
    try {
        postDetailsService(req.query).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
            console.log(error);
        })
    } catch (error){
        res.status(400).send([{message: "Internal error at getPostDetails!"}])
        console.log("Internal error at getPostDetails!");
    }
}

export const getComments = (req, res) => {
    try {
        getCommentsService(req.query).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
            console.log(error);
        })
    } catch (error) {
        res.status(400).send([{message: "Internal error at getComments!"}])
        console.log("Internal error at getComments!");
    }
}

export const postComment = (req, res) => {
    try {
        postCommentService(req.body).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
            console.log(error);
        })
    } catch (error) {
        res.status(400).send([{message: "Internal error at postComment!"}])
        console.log("Internal error at postComment!");
    }
}

export const doSendReply = (req, res) => {
    try {
        sendReplyService(req.body).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
            console.log(error);
        })
    } catch (error) {
        res.status(400).send([{message: "Internal error at doSendReply!"}])
        console.log("Internal error at doSendReply!");
    }
}

export const getReplies = (req, res) => {
    try {
        getRepliesService(req.query).then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
            console.log(error);
        })
    } catch (error) {
        res.status(400).send([{message: "Internal error at getReplies!"}])
        console.log("Internal error at getReplies!");
    }
}