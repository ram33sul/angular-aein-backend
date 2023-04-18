import express from 'express';
import router from './routes/route.js';
import dotenv from 'dotenv';
import database from './config/database.js';
import cookeParser from 'cookie-parser';

dotenv.config();
database();

const app = express();
const PORT = process.env.PORT;

app.use(cookeParser());
app.use(express.json());
app.use('/', router)


app.listen(PORT, (error) => {
    if(error){
        console.log(error);
    } else {
        console.log("Server running at PORT: "+PORT);
    }
})