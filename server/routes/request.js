import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addVisitRequest ,getResidentsByApartmentId,getRequestsByresidentId,handleStatusChange,getRequest,getRequests} from '../controllers/requestController.js';

const router =express.Router()

// Route to get all residents by apartment name
router.get('/req',authMiddleware,getRequests)
router.get('/:id', authMiddleware, getResidentsByApartmentId);
router.post('/add', authMiddleware, addVisitRequest);
router.get('/', authMiddleware, getRequestsByresidentId);
router.patch('/:id/status', authMiddleware, handleStatusChange);
router.get('/view/:id',authMiddleware,getRequest)


export default router;