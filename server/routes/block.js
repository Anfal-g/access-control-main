import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getBlocks, unblockResident } from '../controllers/blockController.js'

const router =express.Router()

router.get('/',authMiddleware,getBlocks)
router.delete('/:id',authMiddleware,unblockResident)

export default router;