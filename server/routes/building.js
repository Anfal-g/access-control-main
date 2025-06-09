import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getBuilding, updateBuilding} from '../controllers/buildingController.js'

const router =express.Router()
// In routes
router.get('/get', authMiddleware, getBuilding);
router.put('/update', authMiddleware, updateBuilding);


export default router;