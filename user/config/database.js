import mongoose from "mongoose";

const connect = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("database connected successfully");
    }).catch((error) => {
        console.log("database connection failed !");
        console.log(error);
    })
}

export default { connect };