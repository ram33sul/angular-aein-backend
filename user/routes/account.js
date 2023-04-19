import express from 'express';
import { doBlockUser, doChangePassword, doEditProfile, doFollow, doGoogleLogin, doLogout, doSendSmsOtp, doShareProfile, doUnblockUser, doUnfollow, doUsersList, doVerifySmsOtp, getBlockedStatus, getBlockedUsersList, getUserDetails, getUsersDetailsFromArray, postLogin, postSignup, verifyUser } from '../controllers/userControllers.js';
import auth from '../authentication/auth.js';
import { fileUploadMulter } from '../services/userServices.js';

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

router.post('/usersDetailsFromArray', getUsersDetailsFromArray);

router.patch('/editProfile', auth, fileUploadMulter(), doEditProfile);

router.post('/follow', auth, doFollow);

router.post('/unfollow', auth, doUnfollow);

router.post('/blockUser', auth, doBlockUser);

router.get('/blockedUsersList', auth, getBlockedUsersList);

router.patch('/unblockUser', auth, doUnblockUser);

router.get('/shareProfile', auth, doShareProfile);

router.get('/blockedStatus', getBlockedStatus);

export default router;