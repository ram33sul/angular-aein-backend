import mongoose from "mongoose";

export default () => { mongoose.connect(process.env.MONGOOSE_URI).then(() => {
    console.log("Database connected successfully");
}).catch(() => {
    console.log("Database cannot be connected!");
})
}

