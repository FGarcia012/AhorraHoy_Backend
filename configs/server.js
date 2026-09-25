'use strict'

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { dbconnection } from './mongo.js';
import apiLimiter from '../src/middlewares/rate-limit-validator.js';
import authRouter from '../src/auth/auth.routes.js';
import userRouter from '../src/user/user.routes.js';
import goalRouter from '../src/goal/goal.routes.js';
import transactionRouter from '../src/transaction/transaction.routes.js';
import financialRouter from '../src/financial/financial.routes.js';
import incomeRouter from '../src/income/income.routes.js';
import statisticsRouter from '../src/statistics/statistics.routes.js';
import { swaggerDocs, swaggerUi } from './swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_PATH = join(__dirname, '../public/uploads');

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.use(cors())
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    }))
    app.use(morgan('dev'))
    app.use(apiLimiter)
    app.use('/uploads', express.static(UPLOADS_PATH))
}

const router = (app) => {
    app.use('/ahorraHoy/v1/auth', authRouter)
    app.use('/ahorraHoy/v1/user', userRouter)
    app.use('/ahorraHoy/v1/goal', goalRouter)
    app.use('/ahorraHoy/v1/transaction', transactionRouter)
    app.use('/ahorraHoy/v1/financial', financialRouter)
    app.use('/ahorraHoy/v1/income', incomeRouter)
    app.use('/ahorraHoy/v1/statistics', statisticsRouter)
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
}

const conectDB = async () => {
    try {
        await dbconnection()
    }catch (err){
        console.log(`Database connection failed: ${err}`)
        process.exit(1)
    }
}

export const initServer = async () => {
    const app = express()
    try{
        middlewares(app)
        conectDB()
        router(app)
        const port = process.env.PORT || 3010
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    }catch (err) {
        console.log(`Server initialization failed: ${err}`)
    }
}