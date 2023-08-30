import { addPostService, deleteCommentService, dislikePostService, doGetPosts, explorePostsService, getCommentsService, getRepliesService, likePostService, postBlockService, postCommentService, postDetailsService, postInteractionsCount, postUnblockService, postsByUser, postsDataService, sendReplyService, totalPostsCount, totalPostsCountToday, undislikePostService, unlikePostService } from "../services/postService.js";

export const addPost = (req,res) => {
    try {
        addPostService({...req.body, userId: req.verifiedUser?._id}).then((response) => {
            console.log(response);
            res.status(200).json(response);
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error);
        })
    } catch (error) {
        console.log("Internal error at addPost!");
        res.status(400).send([{message: "Internal error at addPost!"}])
    }
}

export const getPosts = (req,res) => {
    try {
        doGetPosts({...req.query, userId: req.verifiedUser?._id, token: req.cookies["aein-app-jwtToken"] ?? req.verifiedToken}).then((response) => {
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
        explorePostsService({...req.query, token: req.cookies["aein-app-jwtToken"] ?? req.verifiedToken}).then((response) => {
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

export const getPostsCount = (req, res) => {
    try {
        Promise.allSettled([totalPostsCount(), totalPostsCountToday()])
        .then((response) => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
        })
    } catch (error) {
        res.status(400).send([{message: "Internal error at getTotalPosts!"}])
        console.log("Internal error at getTotalPosts!");
    }
}

export const getPostsInteractionsCount = (req, res) => {
    try {
        postInteractionsCount().then((response) => {
            res.status(200).json(response)
        }).catch(error => {
            res.status(400).send(error)
        })
    } catch (error) {
        res.status(400).send("Internal error at getPostsInteractionsCount")
        console.log("Internal error at getPostsInteractionsCount");
    }
}

export const getPostsData = (req, res) => {
    try {
        postsDataService().then(response => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
        })
    } catch (error) {
        res.status(400).send("Internal error at getPostsData!")
        console.log("Internal error at getPostsData!");
    }
}

export const postBlock = (req, res) => {
    try {
        postBlockService(req.query).then(response => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
        })
    } catch (error) {
        res.status(400).send("Internal error at postBlock!")
        console.log("Internal error at postBlock!");
    }
}

export const postUnblock = (req, res) => {
    try {
        postUnblockService(req.query).then(response => {
            res.status(200).json(response);
        }).catch((error) => {
            res.status(400).send(error)
        })
    } catch (error) {
        res.status(400).send("Internal error at postUnblock!")
        console.log("Internal error at postUnblock!");
    }
}

export const deleteComment = (req, res) => {
    try {
        deleteCommentService(req.query).then(response => {
            res.status(200).json(response);
        }).catch((error) => {
            console.log(error);
            res.status(400).send(error)
        })
    } catch (error) {
        res.status(400).send("Internal error at deleteComment!")
        console.log("Internal error at deleteComment!");
    }
}

