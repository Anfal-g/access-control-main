import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addContact,getMessages ,addReply,getContactById,deleteContact} from '../controllers/contactController.js'

const router =express.Router()
router.get('/',authMiddleware,getMessages)
router.post('/add',authMiddleware,addContact)
router.get('/:id',authMiddleware,getContactById)
router.post('/reply/:id', authMiddleware, addReply);
router.delete('/:id',authMiddleware,deleteContact)




export default router;