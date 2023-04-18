import axios from 'axios';

const auth = (req,res,next) => {
    axios.get(`${process.env.USER_SERVICE}/verifyUser?token=${req.cookies["aein-app-jwtToken"]}`).then((response) => {
        req.verifiedUser = response.data.userData;
        next();
    }).catch((error) => {
        console.log(error);
        res.status(401).send({message: "Request is unauthorized!"});
    })
}

export default auth;