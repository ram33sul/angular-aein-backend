import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, default: null},
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    mobile: {type: Number},
    password: {type: String},
    status: {type: Boolean, default: true},
    followers: {type: Array, default: []},
    following: {type: Array, default: []},
    blockedUsers: {type: Array, default: []},
    createdAt: {type: Date, default: new Date()}
})

const user = mongoose.model("user", userSchema);

export default user;