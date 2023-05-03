import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
    postId: { type: Object, require: true},
    userId: { type: Object, require: true},
    content: { type: String, require: true},
    at: { type: Date, default: new Date()}
})

const Comment = mongoose.model("comments", commentSchema)
export default Comment;