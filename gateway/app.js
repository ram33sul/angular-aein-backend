import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', proxy('http://localhost:4001'));
app.use('/messages', proxy('http://localhost:4002'));
app.use('/', proxy('http://localhost:4003'));

app.listen(4000, () => {
    console.log("gateway is listening at 4000");
})