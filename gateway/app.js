import express from 'express';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

app.use('/user', proxy('http://localhost:4002'));
app.use('/post', proxy('http://localhost:4005'));
app.use('/', proxy('http://localhost:4002'));


app.listen(4000, () => {
    console.log("gateway is listening at 4000");
})