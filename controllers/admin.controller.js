import Mail from '../models/mail.model.js'
import ServiceRequest from "../models/ServiceRequest.model.js";
import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getAllServiceRequests = async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.find({}).populate('UI')
        res.status(200).json(serviceRequests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch service requests' });
    }
};





export const getAllMails = async (req, res) => {
    try {
        const mails = await Mail.find({});
        res.status(200).json(mails);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mails' });
    }
};

export const updateServiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedService = await ServiceRequest.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json(updatedService);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update service status' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};


export const getUserConversation = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        const conversation = await Mail.find({
            $or: [
                { sender: userId },
                { receiver: userId },
            ],
        })
            .populate('sender', 'firstname lastname email') // Populate sender details
            .populate('receiver', 'firstname lastname email') // Populate receiver details
            .sort({ createdAt: -1 });

        if (!conversation || conversation.length === 0) {
            return res.status(200).json({ message: 'No conversation found for this user.' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Conversation retrieved successfully',
            data: conversation,
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation.' });
    }
};


export const sendMailToUser = async (req, res) => {
    const { userId } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ error: 'Subject and message are required.' });
    }

    try {
        const newMail = new Mail({
            sender: req.user.id,
            receiver: userId,
            subject,
            message,
        });
        await newMail.save();
        res.status(201).json({ message: 'Mail sent successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send mail.' });
    }
};




export const updateServiceRequest = async (req, res) => {
    const { requestId } = req.params;
    const { companyInfo, services, Status } = req.body; // Use exact casing for Status

    try {
        const updateData = {};
        
        if (companyInfo) updateData.companyInfo = companyInfo;
        if (services) updateData.services = services;
        if (Status !== undefined) updateData.Status = Status; // Explicitly check for undefined

        const updatedRequest = await ServiceRequest.findByIdAndUpdate(
            requestId,
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        res.status(200).json({ message: "Request updated successfully", updatedRequest });
    } catch (error) {
        res.status(500).json({ message: "Failed to update request", error });
    }
};





// Delete Service
export const deleteService = async (req, res) => {
    const { serviceId } = req.params;

    try {
        const serviceRequest = await ServiceRequest.findOneAndUpdate(
            { "services._id": serviceId },
            { $pull: { services: { _id: serviceId } } },
            { new: true }
        );

        if (!serviceRequest) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully", serviceRequest });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete service", error });
    }
};

export const getUserServices = async (req, res) => {
    const { userId } = req.params;

    try {
        const userServices = await ServiceRequest.find({ UI: userId });

        if (!userServices) {
            return res.status(404).json({ message: "No services found for this user." });
        }

        res.status(200).json(userServices);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user services.", error });
    }
};