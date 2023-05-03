import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    from: {type: Object, required: true},
    to: {type: Object, required: true},
    content: {type: mongoose.Schema.Types.Mixed , required: true},
    type: { type: String, default: 'text'},
    mood: {type: Object, default: {}},
    sendAt: {type: Date, default: new Date()},
    seen: {type: Boolean, default: false},
    deletedUsers: {type: Array, default: []}
},{minimize: false})

const messages = mongoose.model("message", messageSchema);

export default messages;