import { verifyUser } from './verify.js';

const auth = (req,res,next) => {
    const token = req.cookies["aein-app-jwtToken"] ?? req.query.token;
    verifyUser(token).then((response) => {
        req.verifiedUser = {_id: response}
        next();
    }).catch((error) => {
        console.log(error);
        res.status(401).send({message: "Request is unauthorized!"})
    })
}

export default auth;