import mongoose from 'mongoose';
import env from 'dotenv'

env.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log('MongoDB Connected...');
        })
        .catch((error) =>{
            console.log(error)
        })
        
    } catch (err) {
        console.error(err.message);
        process.exit(1); 
    }
};

export default connectDB;