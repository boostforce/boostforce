import express from 'express'
import { verifyToken } from '../authentication/verifyUser.js';

const router = express.Router()

import {
    signup,
    signin,
    signout,
    sendResetPasswordEmail,
    verifyResetPasswordToken,
    sendVerificationEmail,
    verifyNewEmail
} from '../controllers/auth.controller.js';

// Signup route
router.post('/signup', signup);

// Signin route
router.post('/signin' , signin);

// Signout route
router.post('/signout' , signout);

// Send Reset Password Email
router.post('/send-verification-email', verifyToken, sendVerificationEmail);

// Verify Reset Password Token and Update Password
router.post('/reset-password/email' , sendResetPasswordEmail);
router.post('/reset-password/:token' , verifyResetPasswordToken);


router.get('/verify-email/:token', verifyNewEmail);

export default router;


