import { changePasswordService, editProfileService, googleLoginService, loginService, sendSmsOtpService, signupService, userDetailsService, usersListService, verifySmsOtpService, verifyUserService } from '../services/userServices.js'

export const postLogin = async (req, res) => {
    try {
        loginService(req.body).then(async ({user, token}) => {
            res.cookie('aein-app-jwtToken',token, { httpOnly: true });
            return res.status(200).json({user, token});
        }).catch((error) => {
            return res.status(400).send(error);
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at postLogin!", error});
    }

}

export const postSignup = async (req, res) => {
    try {
        signupService(req.body).then(({user, token}) => {
            res.cookie('aein-app-jwtToken',token, { httpOnly: true });
            return res.status(200).json({user, token});
        }).catch ((error) => {
            return res.status(401).json(error);
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at postSignup!", error})
    }
};

export const verifyUser = async (req, res) => {
    try {
        verifyUserService(req.cookies["aein-app-jwtToken"]).then((userData) => {
            return res.status(200).json(userData);
        }).catch((error) => {
            return res.status(400).send(error);
        });
    } catch(error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at verifyUser!"});
    }
}

export const doLogout = async (req, res) => {
    try {
        res.clearCookie("aein-app-jwtToken");
        return res.status(200).send({message: "Successfully logout out"});
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at doLogout!"});
    }
}

export const doGoogleLogin = async (req, res) => {
    try {
        googleLoginService(req.body.googleToken).then(({user, token}) => {
            res.cookie("aein-app-jwtToken", token, {httpOnly: true})
            return res.status(200).json({user, token})
        }).catch((error) => {
            console.log(error);
            return res.status(400).send(error)
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at doGoogleLogin!"})
    }
}

export const doUsersList = async (req,res) => {
    const keyword = req.query.keyword ?? req.params.keyword;
    try {
        usersListService(keyword).then((users) => {
            return res.status(200).send({users});
        }).catch((error) => {
            console.log(error);
            return res.status(400).send(error)
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at doUsersLise!"});
    }
}

export const getUserDetails = async (req,res) => {
    const username = req.query.username ?? req.params.username ?? req.body.username;
    const email = req.query.email ?? req.query.email ?? req.body.email;
    try {
        userDetailsService({username, email}).then((response) => {
            return res.status(200).json(response);
        }).catch((error) => {
            return res.status(400).send(error)
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at getUserDetails!"});
    }
}

export const doSendSmsOtp = async (req,res) => {
    const mobile = req.body.mobile ?? req.query.mobile ?? req.params.mobile;
    try {
        sendSmsOtpService({mobile}).then(() => {
            return res.status(200).json({message: `Otp send to ${mobile}`});
        }).catch((error) => {
            return res.status(400).send(error)
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at doSendSmsOtp!"});
    }
}

export const doVerifySmsOtp = async (req, res) => {
    const mobile = req.body.mobile ?? req.query.mobile ?? req.params.mobile;
    const otpCode = req.body.otpCode ?? req.query.otpCode ?? req.params.otpCode;
    try {
        verifySmsOtpService({mobile, otpCode}).then(({user, token}) => {
            res.cookie("aein-app-jwtToken", token, {httpOnly: true})
            return res.status(200).json({user, token});
        }).catch((error) => {
            return res.status(400).send(error)
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at doVerifySmsOtp!"});
    }
}

export const doChangePassword = async (req, res) => {
    const userId = req.body.userId ?? req.query.userId ?? req.params.userId;
    const newPassword = req.body.newPassword ?? req.query.newPassword ?? req.params.newPassword;
    try {
        changePasswordService({userId, newPassword}).then(({user}) => {
            return res.status(200).json({user});
        }).catch((error) => {
            return res.status(400).send(error);
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at doChangePassword!"});
    }
}

export const doEditProfile = async (req,res) => {
    try {
        editProfileService({...req.body, user: req.verifiedUser}).then((user) => {
            return res.status(200).json(user);
        }).catch((error) => {
            console.log(error);
            return res.status(400).send(error);
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({message: "Internal error occured at doEditProfile!"});
    }
}