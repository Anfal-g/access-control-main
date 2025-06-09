import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addVisitor, getVisitors, deleteVisitor, getVisitor, blockVisitor,
     unblockVisitor, getVisitorsByResidentId,addVisitorByAdmin,updateVisitor } from '../controllers/visitorController.js'


const router =express.Router()

//verify the user +call function inside the controller
// router.get('/:id',authMiddleware,getVisitorsByResidentId)

router.get('/:id',authMiddleware,getVisitors)
router.get('/one/:id',authMiddleware,getVisitor) 
router.post('/add',authMiddleware,  addVisitor) 
router.delete('/:id',authMiddleware,deleteVisitor)
router.post('/block/:id', authMiddleware, blockVisitor)
router.delete('/unblock/:id',authMiddleware,unblockVisitor)
router.put('/:id',authMiddleware,updateVisitor)
router.get('/admin/:id',authMiddleware,getVisitorsByResidentId)
// routes/visitorRoutes.js
router.post('/admin/add', authMiddleware, addVisitorByAdmin)




export default router;