import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
    name: {type: String, require: true},
    color: {type: String, require: true},
    createdAt: {type: String, default: new Date()},
    status: {type: Boolean, default: true}
})

const Mood = mongoose.model("mood", moodSchema);
export default Mood;