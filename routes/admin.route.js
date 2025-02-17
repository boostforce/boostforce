import express from 'express';
import {
    getAllUsers,
    getAllServiceRequests,
    getAllMails,
    updateServiceStatus,
    updateUser,
    getUserConversation,
    sendMailToUser,
    deleteService,
    updateServiceRequest,
} from '../controllers/admin.controller.js';
import { verifyToken } from '../authentication/verifyUser.js';
import { Authenticated } from '../authentication/authenticated.js';
import { getUserServices } from '../controllers/user.controller.js';

const router = express.Router();

// Users
router.get('/users', verifyToken, Authenticated('admin'), getAllUsers);
router.patch('/users/:id', verifyToken, Authenticated('admin'), updateUser);

// Service Requests
router.get('/service-requests', verifyToken, Authenticated('admin'), getAllServiceRequests);
router.patch('/service-requests/:id', verifyToken, Authenticated('admin'), updateServiceStatus);

// Accepted Services

router.patch('/accepted-services/:id', verifyToken, Authenticated('admin'), updateServiceStatus);

// In Progress Services

router.patch('/inprogress-services/:id', verifyToken, Authenticated('admin'), updateServiceStatus);

// Mails
router.get('/mails', verifyToken, Authenticated('admin'), getAllMails);




// Admin Routes
router.get('/conversations/:userId',  verifyToken, Authenticated('admin'),getUserConversation);
router.post('/send-mail/:userId', verifyToken, Authenticated('admin'),  sendMailToUser);


router.put('/service-request/:requestId', verifyToken, Authenticated('admin'), updateServiceRequest);
router.delete('/service/:serviceId', verifyToken, Authenticated('admin'), deleteService);

router.get("/user-services/:userId",verifyToken, Authenticated('admin'), getUserServices);


export default router;
