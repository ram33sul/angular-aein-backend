import { addPostService, doGetPosts } from "../services/postService.js";

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
        doGetPosts(req.query).then((response) => {
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