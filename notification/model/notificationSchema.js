import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    type: { type: String, require: true},
    from: { type: mongoose.Types.ObjectId, require: true},
    to: { type: mongoose.Types.ObjectId, require: true},
    on: { type: mongoose.Types.ObjectId, default: null},
    seen: { type: Boolean, default: false},
    at: { type: Date, default: new Date()},
    status: { type: Boolean, default: true}
})

const Notification = mongoose.model("notifications", notificationSchema);

export default Notification;