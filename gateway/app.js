import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());

app.use('/user', proxy('http://localhost:4002'));
app.use('/uploadMulter', proxy('http://localhost:4010'));
app.use('/', proxy('http://localhost:4002'));


app.listen(4000, () => {
    console.log("gateway is listening at 4000");
})