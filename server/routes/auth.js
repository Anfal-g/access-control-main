import express from "express"
import { login, verify } from "../controllers/authController.js"
import authMiddleWare from "../middleware/authMiddleware.js"
const router = express.Router()

//we will use post methode + path
router.post('/login',login) //function of controller
router.get('/verify',authMiddleWare, verify) //call midleware
export default router;