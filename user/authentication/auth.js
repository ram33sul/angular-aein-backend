import { verifyUserService } from "../services/userServices.js";

const auth = (req,res,next) => {
    verifyUserService(req.cookies["aein-app-jwtToken"]).then(({userData}) => {
        req.verifiedUser = userData;
        next();
    }).catch((error) => {
        return res.status(400).send(error);
    });
}

export default auth;