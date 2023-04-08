import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    from: {type: Object, require: true},
    to: {type: Object, require: true},
    content: {type: String, require: true},
    mood: {type: String, default: "no mood"},
    sendAt: {type: Date, default: new Date()},
    seen: {type: Boolean, default: false}
})

const messages = mongoose.model("message", messageSchema);

export default messages;