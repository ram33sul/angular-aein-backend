import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    userId: {type: Object, required: true},
    withUserId: {type: Object, required: true},
    messages: {type: Array, required: true},
    whoCanReply: {type: String, default: 'anyone'},
    showSeen: {type: Boolean, default: true},
    showTime: {type: Boolean, default: true},
    status: {type: Boolean, default: true},
    isContinous: {type: Boolean, default: false},
    postedAt: {type: Date, default: new Date()},
    seenBy: {type: Array, default: []},
    likes: {type: Array, default: []},
    dislikes: {type: Array, default: []},
    comments: {type: Array, default: []},
    replies: {type: Array, default: []},
    shares: {type: Array, default: []}
})

export default mongoose.model("posts", postSchema);