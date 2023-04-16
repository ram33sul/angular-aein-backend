import express from 'express';
import dotenv from 'dotenv';
import database from './config/database.js';
import accountRouter from './routes/account.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
database.connect();


const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/',accountRouter);

app.listen(PORT, (error) => {
    if(error){
        console.log(`server cannot be started at port: ${PORT} !`);
    } else {
        console.log(`server is up and running at port: ${PORT}`);
    }
});