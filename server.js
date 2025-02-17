import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import adminRouter from './routes/admin.route.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json({ extended: false }));
app.use(cookieParser());

connectDB()


app.use('/', (req, res) => { res.status(200).json('Connected to server successfully')});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message,
    });
});

const PORT = process.env.PORT || 25237;
app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
