import express from 'express';
import auth from '../authentication/auth.js';
import { addPost, doLikePost, doUnlikePost, getExplorePosts, getPosts, getPostsByUser } from '../controllers/postController.js';

const router = express.Router();

router.use(auth);

router.post('/addPost', addPost);

router.get('/getPosts', getPosts);

router.get('/getExplorePosts', getExplorePosts);

router.get('/getPostsByUser', getPostsByUser);

router.patch('/likePost', doLikePost);

router.patch('/unlikePost', doUnlikePost);

export default router;