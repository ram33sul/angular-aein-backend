import mongoose from "mongoose";

const connect = () => {
    const URI = process.env.MONGOOSE_URI;
    mongoose.connect(URI).then(() => {
        console.log(`Database successfully connected: ${URI}`);
    }).catch(() => {
        console.log(`Database cannot be connected`);
    })
}

const database = {connect}

export default database;