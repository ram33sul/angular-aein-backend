import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if(!token){
        return res.status(400).send({message: "Token is missing"});
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
    } catch {
        return res.status(400).send({message: "Token error occured"})
    }
    return next();
}