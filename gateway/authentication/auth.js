import { verifyToken } from "../services/service.js";

const auth = (req,res,next) => {
    const token = req.cookies["aein-app-jwtToken"];
    verifyToken(token).then((verifiedUserId) => {
        next();
    }).catch((error) => {
        console.log(error);
        res.status(401).send({message: "Token is not verified!"});
    })
}

export default auth;