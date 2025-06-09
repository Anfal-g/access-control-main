import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addResident, upload, getResidents, getResident , updateResident, 
    fetchResidentsByAprtId, deleteResident, blockResident, unblockResident} from '../controllers/residentController.js'


const router =express.Router()

//verify the user +call function inside the controller
router.get('/',authMiddleware,getResidents)
router.post('/add',authMiddleware, upload.single('image'), addResident) //pass 1 img
router.get('/:id',authMiddleware,getResident) //edit
router.put('/:id',authMiddleware,updateResident)
router.get('/resident/:id',authMiddleware,fetchResidentsByAprtId)
router.delete('/:id',authMiddleware,deleteResident)
router.post('/block/:id', authMiddleware, blockResident)
router.delete('/unblock/:id',authMiddleware,unblockResident)
// router.get('/visitors/:id', authMiddleware, getVistorsByResidentId) //for visitor


export default router;