import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!token){
                reject({message: 'Token is missing!'});
                return;
            }
            jwt.verify(token, process.env.TOKEN_KEY, async (error, data) => {
                if(error) {
                    reject({message: "Token is invalid or expired!"});
                } else {
                    const userId = data?.userId;
                    if(!userId){
                        reject({message: "Token is invalid!"});
                        return;
                    }
                    resolve(userId);
                }
            });
        } catch (error) {
            console.log(error);
            reject({message: 'Internal error occured at verifyUserService!'});
        }
    })
}