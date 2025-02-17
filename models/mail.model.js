import mongoose from 'mongoose';

const mailSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false, // Tracks if the receiver has read the email
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Mail = mongoose.model('Mail', mailSchema);
export default Mail
