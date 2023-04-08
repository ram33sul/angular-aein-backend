import { validate, exists, validateEmail } from "../validation/validate.js";
import User from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import bcrypt from 'bcrypt';
import twilio from 'twilio';

export const signupService = ({...data}) => {
    return new Promise(async (resolve, reject) => {
        try{
            // validates the inputs
            let errors = exists(data) || validate(data);
            if(errors){
                reject(errors);
                return;
            }
            errors = [];
            // checking whether the email already exist
            const userWithSameEmail = await User.findOne({ email: data.email });
            if(userWithSameEmail){
                errors[errors.length] = {field: 'email', message: "Email already exist!"}
            }
            // checking whether the username already exists
            const userWithSameUsername = await User.findOne({ username: data.username });
            if(userWithSameUsername){
                errors[errors.length] = {field: 'username',message: "Username already exist"};
            }
            if(errors.length){
                reject(errors);
                return;
            }
            // hashing password
            const hashedPassword = await bcrypt.hash(data.password,10);
            const userData = {
                ...data,
                password: hashedPassword,
            }
            // saving user data in database
            const user = await User.create(userData);
            // signing jwt token
            const token = signToken(user._id);
            resolve({user, token});
        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured at signupService"});
        }
    })
}

export const loginService = ({...data}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const isEmail = validateEmail(data.usernameOrEmail);
            let userData;
            if(isEmail) {
                userData = await User.findOne({email: data.usernameOrEmail});
                if(!userData) {
                    reject({field: 'usernameOrEmail', message: 'Email is incorrect!'});
                    return;
                }
            } else {
                userData = await User.findOne({username: data.usernameOrEmail});
                if(!userData) {
                    reject({field: 'usernameOrEmail', message: 'Username is incorrect!'});
                    return;
                }
            }
            const passwordIsCorrect = await bcrypt.compare(data.password, userData.password);
            if(passwordIsCorrect) {
                const token = signToken(userData._id);
                resolve({user: userData, token});
            } else {
                reject({field: 'password',message: "Password is incorrect"})
            }

        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured at loginService"});
        }
    });
};

export const signToken = (userId) => {
    return jwt.sign(
        {
            userId
        },
        process.env.TOKEN_KEY,
        {
            expiresIn: '2h'
        }
    );
}

export const verifyUserService = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!token){
                reject({message: 'Token is missing!'});
                return;
            }
            jwt.verify(token, process.env.TOKEN_KEY, async (error, data) => {
                if(error) {
                    reject({message: "Token is not valid or expired!"});
                } else {
                    const userData = await User.findOne({_id: Object(data?.userId)});
                    if(!userData){
                        reject({message: 'No such User!'});
                        return;
                    }
                    resolve(userData);
                }
            });
        } catch (error) {
            console.log(error);
            reject({message: 'Internal error occured at verifyUserService!'});
        }
    })
}

export const googleLoginService = (googleToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            const email = jwtDecode(googleToken).email;
            const userData = await User.findOne({email});
            if(!userData){
                reject({field: 'email', message: "Please signup first!"});
                return;
            }
            const token = signToken(userData._id);
            resolve({user: userData, token});
        } catch (error) {
            console.log(error);
            reject({message: 'Internal error occured at doGoogleLogin!'});
        }
    })
}

export const usersListService = (keyword) => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.find({$or:[{ username: {$regex: keyword}},{ name: {$regex: keyword}}]});
            resolve(users);
        } catch (error) {
            console.log(error);
            reject({message: 'Internal error occured at usersListService!'});
        }
    })
}

export const userDetailsService = ({username, email}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!(username || email)){
                reject({message: "Identifier must be provided!"});
                return;
            }
            const user = await User.findOne({$or:[{username}, {email}]});
            if(!user?.username){
                reject({message: "No such user!"});
                return;
            }
            resolve(user);
        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured at userDetailsService"});
        }
    })
}

export const sendSmsOtpService = ({mobile}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({mobile});
            if(!user){
                reject({message: "No registered account!"})
                return;
            }
            const accountSid = process.env.TWILIO_SID;
            const authToken = process.env.TWILIO_TOKEN;
            const verifySid = process.env.TWILIO_VERIFY_SID;
            const client = twilio(accountSid, authToken);
            client.verify.v2
                .services(verifySid)
                .verifications.create({
                    to: "+91"+mobile,
                    channel: "sms"
                })
                .then((verification) => console.log(verification.status))
                .then(() => {
                    resolve(true);
                })
                .catch((error) => {
                    console.log(error);
                    reject({message: "Can't send OTP!"});
                })
        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured at sendSmsOtpService!"});
        }
    })
}

export const verifySmsOtpService = ({mobile, otpCode}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!((mobile ?? false ) && (otpCode ?? false))){
                reject({message: "All fields are required!"})
                return;
            }
            const accountSid = process.env.TWILIO_SID;
            const authToken = process.env.TWILIO_TOKEN;
            const verifySid = process.env.TWILIO_VERIFY_SID;
            const client = twilio(accountSid, authToken);
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: "+91"+mobile, code: otpCode })
                .then(async (verification_check) => {
                    if(verification_check.status === 'approved'){
                        const userData = await User.findOne({mobile});
                        const token = signToken(userData._id);
                        resolve({user: userData, token});
                    } else {
                        reject({message: "Otp is incorrect!"});
                    }
                }).catch((error) => {
                    reject({message: "Otp expired!"});
                })
        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured at verifySmsOtpService!"});
        }
    })
}

export const changePasswordService = ({userId, newPassword}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let errors = exists({password: newPassword}) || validate({password: newPassword});
            if(errors){
                reject(errors[0]);
                return;
            }
            let userData = await User.findOne({_id: userId}).catch((error) => {
                console.log(error);
                reject({message: "Database error at changePasswordService!"});
                return;
            });
            if(!userData){
                reject({message: "No such user!"})
                return;
            }
            const hashedPassword = await bcrypt.hash(newPassword,10);
            await User.updateOne({_id: userId},{$set:{password: hashedPassword}}).catch((error) => {
                console.log(error);
                reject({message: "Database error at changePasswordService!"});
                return;
            });
            userData = await User.findOne({_id: userId}).catch((error) => {
                console.log(error);
                reject({message: "Database error at changePasswordService!"});
                return;
            });
            resolve({user: userData});
        } catch (error) {
            console.log(error);
            reject({message: "Internal error occured at changePasswordservice!"});
        }
    })
}