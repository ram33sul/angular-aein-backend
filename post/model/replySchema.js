import mongoose from "mongoose";

const replySchema = mongoose.Schema({
    postId: { type: Object, require: true},
    userId: { type: Object, require: true},
    content: { type: String, require: true},
    mood: {type: String, default: 'no mood'},
    at: { type: Date, default: new Date()}
})

export default mongoose.model("replies", replySchema);