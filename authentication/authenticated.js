import User from '../models/user.model.js'; // Import the User model

export const Authenticated = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Please log in.' });
      }

      const user = await User.findById(req.user.id);

     
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

     
      if (user.role === 'admin') {
        return next();
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: `Forbidden: You don't have access to this resource.` });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};
