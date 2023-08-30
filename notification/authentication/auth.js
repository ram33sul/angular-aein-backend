import jwt from "jsonwebtoken";

const auth = (cookie, urlToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(urlToken){
                jwt.verify(urlToken, process.env.TOKEN_KEY, async (error, data) => {
                    if(error) {
                        reject(false);
                    } else {
                        resolve(data?.userId ?? data?.id);
                    }
                });
                return;
            }
            let token;
            if(!cookie){
                reject(false);
            }
            if(cookie){
                function cookieToObject(cookieStr) {
                    const cookieArr = cookieStr.split("; ");
                    const cookieObj = {};
                
                    cookieArr.forEach((pair) => {
                    const [key, value] = pair.split("=");
                    cookieObj[key] = value;
                    });
                
                    return cookieObj;
                }
                let cookieAsObject = cookieToObject(cookie);
                token = cookieAsObject["aein-app-jwtToken"];
            }
            if(!token){
                reject(false)
            }
            jwt.verify(token, process.env.TOKEN_KEY, async (error, data) => {
                if(error) {
                    reject(false);
                } else {
                    resolve(data?.userId ?? data?.id);
                }
            });
        } catch (error) {
            reject(false);
        }
    })
}

export default auth;