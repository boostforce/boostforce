import mongoose from 'mongoose';

const ServiceRequestSchema = new mongoose.Schema({
    UI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyInfo: {
        companyName: { type: String, required: true },
        address: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        website: { type: String },
        taxId: { type: String },
    },
    services: [
        {
            name: { type: String, required: true },
            data: { type: Object, required: true },
        },
    ],
    Status: {
        type: String,
        enum: ['pending', 'rejected', 'accepted', 'inProgress', 'completed'],
        default: "pending",
    },
   
},{timestamps: true});

const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);
export default ServiceRequest;
