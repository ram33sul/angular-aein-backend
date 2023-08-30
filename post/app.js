import express from 'express';
import router from './routes/route.js';
import dotenv from 'dotenv';
import database from './config/database.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'

dotenv.config();
database();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/', router)


app.listen(PORT, (error) => {
    if(error){
        console.log(error);
    } else {
        console.log("Server running at PORT: "+PORT);
    }
})