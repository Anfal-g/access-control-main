import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addApartment, getApartments } from '../controllers/apartmentController.js'
import { getApartment, updateApartment, deleteApartment } from '../controllers/apartmentController.js';


const router =express.Router()

//verify the user +call function inside the controller
router.get('/',authMiddleware,getApartments)
router.post('/add',authMiddleware,addApartment)
router.get('/:id',authMiddleware,getApartment) //edit
router.put('/:id',authMiddleware,updateApartment)
router.delete('/:id',authMiddleware,deleteApartment)

export default router;