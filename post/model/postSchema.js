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
    commentsCount: {type: Number, default: 0},
    repliesCount: {type: Number, default: 0},
    sharesCount: {type: Number, default: 0}
})

export default mongoose.model("posts", postSchema);