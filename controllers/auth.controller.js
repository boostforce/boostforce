import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import dotenv from 'dotenv';
import errorHandler from '../utils/error.js';
import nodemailer from 'nodemailer';

dotenv.config();

export const signup = async (req, res, next) => {
    const {
      firstname,
      lastname,
      birthday,
      username,
      email,
      phone,
      password,
      address,
      city,
      postalCode,
      country,
    } = req.body;
  
    // Validate email
    if (!validator.isEmail(email)) {
      return next(errorHandler(400, "Invalid email."));
    }
  
    // Validate phone number
    if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return next(errorHandler(400, "Invalid phone number."));
    }
  
    // Validate username
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(username)) {
      return next(errorHandler(400, "Invalid username! Use only letters, numbers, and underscores."));
    }
  
    // Validate password
    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*.])(?=.{8,})/;
    if (!passwordPattern.test(password)) {
      return next(
        errorHandler(
          400,
          "Password must be at least 8 characters long, contain at least 1 number, and 1 special character."
        )
      );
    }
  
    // Validate birthday (18+)
    const userAge = Math.floor((new Date() - new Date(birthday)) / (365.25 * 24 * 60 * 60 * 1000));
    if (userAge < 18) {
      return next(errorHandler(400, "You must be at least 18 years old to register."));
    }
  
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "This email is already in use."));
    }
  
    // Check if username is already taken
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return next(errorHandler(400, "This username is already taken."));
    }
  
    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10);
  
    try {
      // Create new user
      const newUser = new User({
        firstname,
        lastname,
        birthday,
        username,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        address,
        city,
        postalCode,
        country,
      });
  
      await newUser.save();
      res.status(201).json("User Created Successfully");
    } catch (error) {
      next(error);
    }
  };

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return next(errorHandler(404, 'User not found.'));
        }

        const isPasswordCorrect = await bcryptjs.compare(password, user.password);
        if (!isPasswordCorrect) {
            return next(errorHandler(400, 'Invalid credentials.'));
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const { password: pass, ...rest } = user._doc;

        res.cookie('access_token', token, { httpOnly: true }).status(200).json({ user: rest });
    } catch (error) {
        next(error);
    }
};

export const signout = async (req, res, next) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json('User has been logged out.');
    } catch (error) {
        next(error);
    }
};



export const sendVerificationEmail = async (req, res, next) => {
    const { newEmail } = req.body;

    
    if (!validator.isEmail(newEmail)) {
        return next(errorHandler(404, 'Invalid email format.'));
    }

   
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
        if (existingUser.isEmailVerified) {
            return next(errorHandler(403, 'This email is already in use and verified.'));
        }
    }

   
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(errorHandler(404, 'User not found.'));
    }

    try {
        
        const token = jwt.sign({ id: user._id, newEmail }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const url = `http://localhost:5173/verify-email/${token}`;

        
        const transporter = nodemailer.createTransport({
            service: "gmail",
          
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASSWORD, 
            },
        });

        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif, Helvetica, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h1 {
                    font-weight: bold;
                    font-size: 28px;
                    color: #035afc;
                }
                .header p {
                    font-size: 18px;
                    color: #555;
                }
                .content {
                    text-align: center;
                    font-size: 16px;
                    line-height: 1.5;
                }
                .content p {
                    margin-bottom: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #035afc;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 18px;
                    text-align: center; /* Ensures text alignment in some email clients */
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>BoostForce</h1>
                    <p>"Where you find your digital home"</p>
                </div>
                <div class="content">
                    <p>Hello!</p>
                    <p>Thank you for signing up with BoostForce. We're excited to have you on board!</p>
                    <p>Please click the button below to verify your email address and complete your registration:</p>
                    <a href="${url}" class="button">Verify Your Account</a>
                    <p>If you did not create an account with us, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>Thank you for joining BoostForce!<br>We're glad to have you with us.</p>
                </div>
            </div>
        </body>
        </html>`;

        await transporter.sendMail({
            from: process.env.EMAIL, 
            to: newEmail,
            subject: 'Verify your new email',
            html: html,
        });

        res.status(200).json('Verification email sent to your new email address.');
    } catch (error) {
        next(error);
    }
};




export const verifyNewEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
      // Verify the token and extract user ID and new email
      const { id, newEmail } = jwt.verify(token, process.env.JWT_SECRET);

      // Find the current user by ID
      const user = await User.findById(id);
      if (!user) {
          return next(errorHandler(404, 'User not found.'));
      }

      // Check if another user has the new email and has verified it
      const existingUserWithEmail = await User.findOne({ email: newEmail, isEmailVerified: true });
      if (existingUserWithEmail) {
          return next(errorHandler(404, 'This email is already in use by another verified account.'));
      }

      // Update the user's email and set isEmailVerified to true
      user.email = newEmail;
      user.isEmailVerified = true;
      await user.save();
     

      res.status(200).json('Email updated successfully.');
  } catch (error) {
    console.log(error)
      return next(errorHandler(404, 'Error verifying email. Try again.'));
  }
};

export const sendResetPasswordEmail = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(errorHandler(404, 'User not found.'));
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            to: email,
            subject: 'Reset Your Password',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json('Password reset email sent successfully.');
    } catch (error) {
        next(error);
    }
};

export const verifyResetPasswordToken = async (req, res, next) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(id);
        if (!user) {
            return next(errorHandler(404, 'User not found.'));
        }

        const hashedPassword = bcryptjs.hashSync(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json('Password reset successfully.');
    } catch (error) {
        next(errorHandler(400, 'Invalid or expired token.'));
    }
};
