import { verifyUserService } from "../services/userServices.js";

const auth = (req,res,next) => {
    const token = req.cookies["aein-app-jwtToken"] ?? req.headers["aein-app-jwttoken"] ?? req.query.token ?? req.headers.authorization;
    verifyUserService(token).then(({userData}) => {
        req.verifiedUser = userData;
        next();
    }).catch((error) => {
        return res.status(400).send(error);
    });
}

export default auth;