import express from 'express';
import { doChangePassword, doEditProfile, doGoogleLogin, doLogout, doSendSmsOtp, doUsersList, doVerifySmsOtp, getUserDetails, postLogin, postSignup, verifyUser } from '../controllers/userControllers.js';
import auth from '../authentication/auth.js';

const router = express.Router();

router.post('/login',postLogin);

router.post('/signup', postSignup);

router.get('/verifyUser', verifyUser);

router.get('/logout', doLogout);

router.post('/googleLogin', doGoogleLogin);

router.get('/usersList',auth, doUsersList);

router.get('/userDetails',auth, getUserDetails);

router.post('/sendSmsOtp', doSendSmsOtp);

router.post('/verifySmsOtp', doVerifySmsOtp);

router.patch('/changePassword',auth, doChangePassword);

router.patch('/editProfile', auth, doEditProfile)


export default router;