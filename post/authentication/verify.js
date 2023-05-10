import jwt from 'jsonwebtoken';

export const verifyUser = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!token){
                reject({message: 'Token is missing!'});
                return;
            }
            jwt.verify(token, process.env.TOKEN_KEY, (error, data) => {
                if(error) {
                    reject({message: "Token is not valid or expired!"});
                } else {
                    resolve(data?.userId);
                }
            });
        } catch (error) {
            reject({message: 'Internal error occured at verifyUserService!'});
        }
    })
}