import express from 'express';
import { createServiceRequest, getConversation, getUserDetails, getUserServices, sendMail, updateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../authentication/verifyUser.js';

const router = express.Router();

// Update user details
router.put('/update-profile', verifyToken, updateUser);
// Route to send an email
router.post('/send', verifyToken, sendMail);

// Route to get the conversation between the user and admin
router.get('/conversation', verifyToken, getConversation);
router.post('/service-requests',verifyToken, createServiceRequest);
router.get('/mine', verifyToken, getUserServices);
router.get('/get-user-details', verifyToken, getUserDetails);

export default router;
