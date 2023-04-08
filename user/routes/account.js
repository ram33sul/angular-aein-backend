import express from 'express';
import { doChangePassword, doGoogleLogin, doLogout, doSendSmsOtp, doUsersList, doVerifySmsOtp, getUserDetails, postLogin, postSignup, verifyUser } from '../controllers/userControllers.js';
import twilio from 'twilio';
import Readline from 'readline';

const router = express.Router();

router.post('/login', postLogin);

router.post('/signup', postSignup);

router.get('/verifyUser', verifyUser);

router.get('/logout', doLogout);

router.post('/googleLogin', doGoogleLogin);

router.get('/usersList', doUsersList);

router.get('/userDetails', getUserDetails);

router.post('/sendSmsOtp', doSendSmsOtp);

router.post('/verifySmsOtp', doVerifySmsOtp);

router.patch('/changePassword', doChangePassword);


export default router;