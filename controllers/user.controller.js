import User from '../models/user.model.js';
import errorHandler from '../utils/error.js';
import Mail from '../models/mail.model.js';
import ServiceRequest from '../models/ServiceRequest.model.js';

export const sendMail = async (req, res, next) => {
    const { subject, message } = req.body;
    const sender = req.user.id
    const receiver = '673ce89864f690b0e769b4fb'

    if (!subject || !message) {
        return res.status(400).json({ error: 'Subject and message are required.' });
    }

    try {
        const mail = new Mail({
            sender,
            receiver,
            subject,
            message,
        });
        await mail.save();

        res.status(201).json({ message: 'Mail sent successfully.', mail });
    } catch (error) {
        next(error);
    }
};

export const getConversation = async (req, res, next) => {
  const participant = req.user.id;

  try {
      // Fetch messages where the user is either the sender or receiver
      const conversation = await Mail.find({
          $or: [
              { sender: participant },
              { receiver: participant },
          ],
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('sender', 'firstname lastname email') // Optionally populate sender details
      .populate('receiver', 'firstname lastname email'); // Optionally populate receiver details

      // Respond with the conversation
      res.status(200).json({
          status: 'success',
          message: 'Conversation retrieved successfully',
          data: conversation,
      });
  } catch (error) {
      console.error('Error fetching conversation:', error.message);
      next({
          status: 500,
          message: 'Failed to fetch conversation. Please try again later.',
      });
  }
};


export const updateUser = async (req, res, next) => {
    const userId = req.user.id; // Assuming user ID is extracted from a middleware after token verification
    const { firstname, lastname, phone, username, birthday } = req.body; // Exclude email and password
  
    try {
      // Validate required fields
      if (!firstname || !lastname) {
        return next(errorHandler(400, 'Firstname and lastname are required.'));
      }
  
      // Check if the username is already taken by another user
      const existingUsername = await User.findOne({ username });
      if (existingUsername && existingUsername._id.toString() !== userId) {
        return next(errorHandler(400, 'This username is already taken.'));
      }
  
      // Update user details
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstname, lastname, phone, username, birthday },
        { new: true, runValidators: true } // Return the updated user document
      );
  
      if (!updatedUser) {
        return next(errorHandler(404, 'User not found.'));
      }
  
      res.status(200).json({
        success: true,
        message: 'User details updated successfully.',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };
  
  

  export const createServiceRequest = async (req, res) => {
    const { companyInfo, selectedServices } = req.body;

    const errors = [];

    // Validate company info
    if (!companyInfo) {
        errors.push('Company information is missing.');
    } else {
        ['companyName', 'address', 'email', 'phone'].forEach((field) => {
            if (!companyInfo[field]) {
                errors.push(`Missing field: ${field}`);
            }
        });
    }

    // Validate selected services
    if (!selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
        errors.push('No services selected.');
    } else {
        selectedServices.forEach((service) => {
            const serviceData = req.body[service];
            if (!serviceData) {
                errors.push(`${service} details are missing.`);
            } else {
                Object.entries(serviceData).forEach(([key, value]) => {
                    if (!value) {
                        errors.push(`Missing field "${key}" in ${service}.`);
                    }
                });
            }
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Create a new service request
        const newRequest = new ServiceRequest({
            UI: req.user.id,
            companyInfo,
            services: selectedServices.map((service) => ({
                name: service,
                data: req.body[service],
            })),
        });

        const savedRequest = await newRequest.save();
        res.status(201).json({ message: 'Service request created.', request: savedRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create service request.' });
    }
};

export const getUserServices = async (req, res) => {
  try {
      const userId = req.user.id; // Assuming the user ID is available in the JWT
      const userServices = await ServiceRequest.find({ UI: userId }).exec();

      if (!userServices || userServices.length === 0) {
          return res.status(404).json({ message: 'No services found for the user.' });
      }

      res.status(200).json(userServices);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user services.' });
  }
};


export const getUserDetails = async (req, res, next) => {
  try {
    
    // Fetch all users from the database, excluding the password field
    const users = await User.findById(req.user.id).select('-password');

    // If no users are found, return a 404 error
    if (!users || users.length === 0) {
      return next(errorHandler(404, 'No users found.'));
    }

    // Return the list of users
    res.status(200).json(users);
  } catch (error) {
    // Handle any errors
    next(error);
  }
};