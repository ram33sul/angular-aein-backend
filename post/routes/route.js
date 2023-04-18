import express from 'express';
import auth from '../authentication/auth.js';
import { addPost } from '../controllers/postController.js';

const router = express.Router();

router.post('/addPost', auth, addPost);

export default router;