import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {verifyQR,getEntryLogs} from '../controllers/scannerController.js'


const router =express.Router()

router.post('/verify',verifyQR);
router.get('/',authMiddleware,getEntryLogs)

export default router;