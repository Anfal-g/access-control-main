import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import 'dotenv/config'; // Charge les variables d'environnement depuis .env
import connectToDataBase from './db/db.js'
import apartmentRouter from './routes/apartment.js'
import residentRouter from './routes/resident.js'
import settingRouter from './routes/setting.js'
import dashboardRouter from './routes/dashboard.js'
import contactRouter from './routes/contact.js'
import buildingRouter from './routes/building.js'
import seedDefaultBuilding from './seedDefaultBuilding.js';
import notificationRouter from './routes/notification.js'
import bodyParser from 'body-parser';
import scannerRouter from './routes/scanner.js'
import scannerLeaveRouter from './routes/scannerleave.js';
import blockRouter from './routes/block.js'
import visitorRouter from './routes/visitor.js'
import requestRouter from './routes/request.js'


connectToDataBase()

const app =express()
app.use(cors())
app.use(bodyParser.json()); // for parsing application/json 
app.use(express.json())
app.use(express.static('public/uploads'))
app.use('/api/auth',authRouter)
app.use('/api/apartment',apartmentRouter)
app.use('/api/resident',residentRouter)

app.use('/api/setting',settingRouter)
app.use('/api/dashboard',dashboardRouter)
app.use('/api/contact',contactRouter)
app.use('/api/building',buildingRouter)
app.use('/api/notification',notificationRouter)
app.use('/api/scanner',scannerRouter)
app.use('/api/scannerleave',scannerLeaveRouter)
app.use('/api/block',blockRouter)
app.use('/api/visitor',visitorRouter)
app.use('/api/request',requestRouter)

app.listen(process.env.PORT, async () => {
    console.log(`Server running on port ${process.env.PORT}`);
    await seedDefaultBuilding();
});