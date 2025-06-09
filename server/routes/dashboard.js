import express from 'express'
import authMiddleware  from '../middleware/authMiddleware.js' // we should verify the user
import { getSummary } from '../controllers/dashboardController.js';

const router =express.Router()

router.get('/summary', authMiddleware, getSummary)

export default router;