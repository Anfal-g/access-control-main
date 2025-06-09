import express from 'express';
import { getNotifications, markAllAsRead, getUnreadNotificationCount, markAsRead,getRequestes } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/messages', authMiddleware, getNotifications);
router.get('/requestes', authMiddleware, getRequestes);
router.post('/markAllAsRead', authMiddleware, markAllAsRead);
// router.post('/notification/markAsRead/:id', authMiddleware, markAsRead);
router.get('/unread-count', authMiddleware, getUnreadNotificationCount);
router.patch('/:id/markAsRead', authMiddleware, markAsRead);


export default router;
