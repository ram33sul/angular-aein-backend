import { validate, exists, validateEmail, validateName, validateUsername, validateBio } from "../validation/validate.js";
import User from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";
import bcrypt from 'bcrypt';
import twilio from 'twilio';
import { v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import multer from "multer";
import mongoose, { mongo } from "mongoose";
import { error } from "console";

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
                    if(data?.userId){
                        const userData = await User.findOne({_id: new mongoose.Types.ObjectId(data.userId)}).catch((error)=>{
                            reject({message: "Database error at verifyUserService!"})
                        });
                        if(!userData){
                            reject({message: 'No such User!'});
                            return;
                        }
                        resolve({userData, expiresAt: data.exp * 1000});
                    } else {
                        resolve(true)
                    }
                }
            });
        } catch (error) {
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
            reject({message: 'Internal error occured at doGoogleLogin!'});
        }
    })
}

export const usersListService = ({keyword, id}) => {
    return new Promise(async (resolve, reject) => {
        try {
            id = new mongoose.Types.ObjectId(id)
            const users = await User.find({
                $and: [
                    {
                        $or: [
                            {
                                username: {
                                    $regex: keyword
                                }
                            },{
                                name: {
                                    $regex: keyword
                                }
                            }
                        ]
                    },{
                        blockedUsers: {
                            $nin: [
                                id
                            ]
                        }
                    }
                ]
            });
            resolve(users);
        } catch (error) {
            reject({message: 'Internal error occured at usersListService!'});
        }
    })
}

export const userDetailsService = ({username, email, userId, id}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!(username || email || userId)){
                reject({message: "Identifier must be provided!"});
                return;
            }
            id = new mongoose.Types.ObjectId(id)
            let user = {};
            if(userId == null || userId == 'null'){
                user = await User.findOne({
                    $and: [
                        {
                            $or:[
                                {
                                    username
                                }, {
                                    email
                                }
                            ]
                        },{
                            blockedUsers: {
                                $nin: [
                                    id
                                ]
                            }
                        }
                    ]
                });
            } else {
                userId = new mongoose.Types.ObjectId(userId)
                user = await User.findOne({
                    $and: [
                        {
                            $or:[
                                {
                                    _id: userId
                                }, {
                                    username
                                }, {
                                    email
                                }
                            ]
                        },{
                            blockedUsers: {
                                $nin: [
                                    id
                                ]
                            }
                        }
                    ]
                });
            }
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
                    reject({message: "Can't send OTP!"});
                })
        } catch (error) {
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
                reject({message: "Database error at changePasswordService!"});
                return;
            });
            if(!userData){
                reject({message: "No such user!"})
                return;
            }
            const hashedPassword = await bcrypt.hash(newPassword,10);
            await User.updateOne({_id: userId},{$set:{password: hashedPassword}}).catch((error) => {
                reject({message: "Database error at changePasswordService!"});
                return;
            });
            userData = await User.findOne({_id: userId}).catch((error) => {
                reject({message: "Database error at changePasswordService!"});
                return;
            });
            resolve({user: userData});
        } catch (error) {
            reject({message: "Internal error occured at changePasswordservice!"});
        }
    })
}

export const editProfileService = ({name, username, bio, profilePic, user}) => {
    return new Promise(async (resolve, reject) => {
        try{
            const userId = user?._id;
            if(!userId){
                reject({message: "UserId is required!"});
                return;
            }
            let errors = [];
            if(!name){
                errors[errors.length] = {field: 'name', message: "Name is required!"};
            }
            if(!username){
                errors[errors.length] = {field: 'username', message: "Username is required!"};
            }
            if(errors.length){
                reject(errors)
                return;
            }
            bio = bio?.trim();
            const validName = validateName(name);
            const validUsername = validateUsername(username);
            const validBio = validateBio(bio);
            if(!validName){
                errors[errors.length] = {field: 'name', message: "Name is not valid!"}
            }
            if(!validUsername){
                errors[errors.length] = {field: 'username', message: "Username is not valid!"};
            }
            if(!validBio){
                errors[errors.length] = {field: 'bio', message: "limit exceeded (5 lines & 50 letters!"};
            }
            if(errors.length){
                reject(errors);
                return;
            }
            // checking whether the username already exists
            if(username !== user?.username){
                const userWithSameUsername = await User.findOne({ username });
                if(userWithSameUsername){
                    reject([{field: 'username',message: "Username already exist"}]);
                    return;
                }
            }
            let profilePicUrl = ''
            if(profilePic){
                await uploadToCloudinary(`profilePics/${user?._id}.png`).then((result) => {
                    profilePicUrl = result.url;
                }).catch((error) => {
                    reject([{message: "Can't be uploaded to cloudinary!"}]);
                    return;
                });
            }
            // saving user data in database
            await User.updateOne({_id: userId},{$set:{name, username, bio, profilePicUrl}});
            const userData = await User.findOne({_id: userId});
            resolve(userData);
        } catch (error) {
            reject({message: "Internal error occured at editProfileService!"});
        }
    })
}

export const fileUploadMulter = () => {
    return multer({
        storage: multer.diskStorage({
            destination: function(req, file, cb) {
              cb(null, 'profilePics/');
            },
            filename: function(req, file, cb) {
                const fileName = `${req.verifiedUser._id}.png`;
              cb(null, fileName);
            }
        }),
        fileFilter: function(req, file, cb) {
            if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
              req.fileValidationError = 'Only PNG and JPEG files are allowed';
              return cb(null, false, req.fileValidationError);
            }
            cb(null, true);
        },
        limits: { fileSize: 1024 * 1024 * 1 }
    }).single('image')
}



export const uploadToCloudinary = async (localFilePath) => {
    cloudinary.config({
        cloud_name: "db6r6str9",
        api_key: "839247658482686",
        api_secret: "tSezfaCf3bEOuaCYFQ0vNbOlKhk"      
      });
    const mainFolderName = "main";
    const filePathOnCloudinary = mainFolderName + '/' + localFilePath;
    return cloudinary.uploader.upload(localFilePath,{"public_id": filePathOnCloudinary})
    .then((result) => {
        fs.unlinkSync(localFilePath);
        return ({
            url: result.url
        })
    }).catch((error) => {
        fs.unlinkSync(localFilePath);
        return ({
            message: "Can't be uploaded to cloudinary!"
        })
    })
}

export const usersDetailsFromArray = ({usersList, userId}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!usersList){
                reject([{message: "usersList is required!"}]);
                return;
            }
            userId = new mongoose.Types.ObjectId(userId)
            usersList = usersList.map(id => new mongoose.Types.ObjectId(id));
            User.aggregate([
                {
                    $match: {
                        _id: {
                            $in: usersList
                        }
                    }
                },{
                    $project: {
                        _id: 1,
                        name: 1,
                        username: 1,
                        status: 1,
                        bio: 1,
                        profilePicUrl: 1,
                        blockedStatus: {
                            $cond: [
                                {
                                    $in: [
                                        userId,
                                        "$blockedUsers"
                                    ]
                                },
                                true,
                                false
                            ]
                        }
                    }
                },{
                    $sort: {
                        _id: 1
                    }
                }
            ]).then((response) => {
                resolve(response)
            }).catch((error) => {
                console.log("Database error at userDetailsFromArray");
                reject([{message: "Database error at userDetailsFromArray"}])
            })
        } catch (error) {
            console.log(error);
            reject([{message: "Internal error at usersDetailsFromArray"}])
        }
    })
}

export const followService = ({followingUserId, followedUserId}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(!(followedUserId && followingUserId)){
                reject([{message: "followedUserId and followingUserId are required!"}])
                return;
            }
            if(followedUserId === followingUserId){
                reject([{message: "followedUserId and followingUserId can't be same!"}]);
                return;
            }
            followedUserId = new mongoose.Types.ObjectId(followedUserId);
            followingUserId = new mongoose.Types.ObjectId(followingUserId);
            const followedUser = await User.findOne({
                _id: followedUserId,
                blockedUsers: {
                    $nin: [
                        followingUserId
                    ]
                }
            }).catch(() => {
                return reject([{message: "Database error at followService! (1)"}])
            })
            if(!followedUser?.username){
                return reject([{message: "Can't follow the user!"}])
            }
            User.bulkWrite([
                {
                    updateOne: {
                        filter: {
                            _id: followingUserId
                        },
                        update: {
                            $addToSet: {
                                following: followedUserId
                            }
                        }
                    }
                }, {
                    updateOne: {
                        filter: {
                            _id: followedUserId
                        },
                        update: {
                            $addToSet: {
                                followers: followingUserId
                            }
                        }
                    }
                }
            ]).then(() => {
                User.findOne({
                    _id: followingUserId
                }).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject([{message: "Database error at followService (3)!"}])
                })
            }).catch((error) => {
                console.log(error);
                reject([{message: "Database error at followService (2)!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at followService!"}])
        }
    })
}

export const unfollowService = ({unfollowingUserId, unfollowedUserId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!(unfollowedUserId && unfollowingUserId)){
                reject([{message: "unfollowedUserId and unfollowingUserId are required!"}])
                return;
            }
            if(unfollowedUserId === unfollowingUserId){
                reject([{message: "followedUserId and followingUserId can't be same!"}]);
                return;
            }
            unfollowedUserId = new mongoose.Types.ObjectId(unfollowedUserId);
            unfollowingUserId = new mongoose.Types.ObjectId(unfollowingUserId);
            User.bulkWrite([
                {
                    updateOne: {
                        filter: {
                            _id: unfollowingUserId
                        },
                        update: {
                            $pull: {
                                following: unfollowedUserId
                            }
                        }
                    }
                }, {
                    updateOne: {
                        filter: {
                            _id: unfollowedUserId
                        },
                        update: {
                            $pull: {
                                followers: unfollowingUserId
                            }
                        }
                    }
                }
            ]).then(() => {
                User.findOne({
                    _id: unfollowingUserId
                }).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject([{message: "Database error at followService (2)!"}])
                })
            }).catch((error) => {
                console.log(error);
                reject([{message: "Database error at followService (1)!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at followService!"}])
        }
    })
}

export const blockUserService = ({userId, userIdToBeBlocked}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!(userId && userIdToBeBlocked)){
                return reject([{message: "userId and userIdToBeBlocked are required!"}]);
            }
            if(userId === userIdToBeBlocked){
                return reject([{message: "userId and userIdToBeBlocked can't be same!"}])
            }
            userId = new mongoose.Types.ObjectId(userId);
            userIdToBeBlocked = new mongoose.Types.ObjectId(userIdToBeBlocked);
            User.bulkWrite([
                {
                    updateOne: {
                        filter: {
                            _id: userId
                        },
                        update: {
                            $addToSet: {
                                blockedUsers: userIdToBeBlocked
                            },
                            $pullAll: {
                                followers: [userIdToBeBlocked],
                                following: [userIdToBeBlocked]
                            }
                        }
                    }
                },{
                    updateOne: {
                        filter: {
                            _id: userIdToBeBlocked
                        },
                        update: {
                            $pullAll: {
                                followers: [userId],
                                following: [userId]
                            }
                        }
                    }
                }
            ]).then(() => {
                User.findOne({
                    _id: userId
                }).then((response) => {
                    resolve(response)
                }).catch((error) => {
                    reject([{message: "Database error at blockUserService (2)!"}])
                })
            }).catch((error) => {
                reject([{message: "Database error at blockUserService (1)!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at blockUserService!"}])
        }
    })
}

export const blockedUsersListService = ({userId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!userId){
                reject([{message: "UserId is required!"}]);
            }
            userId = new mongoose.Types.ObjectId(userId)
            User.aggregate([
                {
                    $match: {
                        _id: userId
                    }
                },{
                    $unwind: "$blockedUsers"
                },{
                    $lookup: {
                        from: "users",
                        localField: "blockedUsers",
                        foreignField: "_id",
                        as: "blockedUser"
                    }
                },{
                    $project: {
                        _id: {
                            $first: "$blockedUser._id"
                        },
                        name: {
                            $first: "$blockedUser.name"
                        },
                        username: {
                            $first: "$blockedUser.username"
                        },
                        status: {
                            $first: "$blockedUser.status"
                        },
                        profilePicUrl: {
                            $first: "$blockedUser.profilePicUrl"
                        }
                    }
                }
            ]).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject([{message: "Database error at blockedUsersListService!"}]);
            })
        } catch (error) {
            reject([{message: "Internal error at blockedUsersListService!"}])
        }
    })
}

export const unblockUserService = ({userId, unblockUserId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!(userId && unblockUserId)){
                return reject([{message: "userId and userIdToBeBlocked are required!"}]);
            }
            if(userId === unblockUserId){
                return reject([{message: "userId and userIdToBeBlocked can't be same!"}])
            }
            userId = new mongoose.Types.ObjectId(userId);
            unblockUserId = new mongoose.Types.ObjectId(unblockUserId);
            User.updateOne({
                _id: userId
            },{
                $pull: {
                    blockedUsers: unblockUserId
                }
            }).then(() => {
                User.findOne({
                    _id: userId
                }).then((response) => {
                    resolve(response)
                }).catch((error) => {
                    reject([{message: "Database error at unblockUserService (2)!"}])
                })
            }).catch((error) => {
                reject([{message: "Database error at unblockUserService (1)!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at unblockUserService!"}])
        }
    })
}

export const shareProfileService = ({userId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!userId){
                return reject([{message: "UserId is required!"}])
            }
            resolve({url: `http://localhost:3000/profile?userId=${userId}`});
        } catch (error) {
            reject([{message: "Internal error at shareProfileService!"}])
        }
    })
}

export const blockedStatusService = ({firstUserId, secondUserId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!(firstUserId && secondUserId)){
                return reject([{messsage: "Both userId are requried!"}])
            }
            firstUserId = new mongoose.Types.ObjectId(firstUserId);
            secondUserId = new mongoose.Types.ObjectId(secondUserId);
            User.findOne({
                $or: [
                    {
                        _id: firstUserId,
                        blockedUsers: {
                            $in: [
                                secondUserId
                            ]
                        }
                    },{
                        _id: secondUserId,
                        blockedUsers: {
                            $in: [
                                firstUserId
                            ]
                        }
                    }
                ]
            }).then((response) => {
                if(response.username){
                    return resolve({blockedStatus: true})
                }
                return resolve({blockedStatus: false})
            }).catch((error) => {
                return reject([{message: "Database error at blockedStatusService!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at blockesStatusService!"}])
        }
    })
}

export const followingList = ({userId}) => {
    return new Promise((resolve, reject) => {
        try {
            if(!userId){
                return reject([{message: "UserId is required!"}])
            }
            userId = new mongoose.Types.ObjectId(userId);
            User.findOne({
                _id: userId
            }).then((response) => {
                resolve(response.following);
            }).catch((error) => {
                reject([{message: "Database error at followingList!"}])
            })
        } catch (error) {
            reject([{message: "Internal error at followingList!"}])
        }
    })
}

export const totalUsersCount = () => {
    return new Promise((resolve, reject) => {
        User.find().count().then((response) => {
            resolve(response)
        }).catch((error) => {
            reject([{message: "Database error at totalPostsService!"}])
        })
    })
}

export const totalUsersCountToday = () => {
    return new Promise ((resolve, reject) => {
        var start = new Date();
        start.setHours(0,0,0,0);
        var end = new Date();
        end.setHours(23,59,59,999);
        User.find({
            createdAt: {
                $gte: start,
                $lt: end
            }
        }).count().then((response) => {
            resolve(response)
        }).catch(() => {
            reject([{message: "Database error at totalPostsCountToday!"}])
        })
    })
}

export const usersDataService = () => {
    return new Promise ((resolve, reject) => {
        User.find().sort({createdAt: -1}).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject("Database error at usersDataService!")
        })
    })
}
