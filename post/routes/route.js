import express from 'express';
import auth from '../authentication/auth.js';
import { addPost, getPosts } from '../controllers/postController.js';

const router = express.Router();

router.post('/addPost', auth, addPost);

router.get('/getPosts', auth, getPosts);

export default router;