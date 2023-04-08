import express from 'express';

import { sendMessage, getMessages, getOverallMessages, messagingWebSocket } from '../controllers/messagesControllers.js';
const router = express.Router();

router.post('/sendMessage', sendMessage);
router.get('/getMessages', getMessages);
router.get('/getOverallMessages', getOverallMessages);
// router.get('/', messagingWebSocket);

export default router;