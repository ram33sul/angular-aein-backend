import { addPostService } from "../services/postService.js";

export const addPost = (req,res) => {
    addPostService({...req.body, userId: req.verifiedUser?._id}).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).send(error);
    })
}