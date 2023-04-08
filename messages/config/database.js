import mongoose from "mongoose";

const connect = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Messages database connnected successfully");
    }).catch((error) => {
        console.log("Messages database connection failed!");
        console.log(error);
    })
}

export default { connect }