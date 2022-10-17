import mongoose from 'mongoose';
import mongooseConnect from './mongoose-connection';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
    dob: {
        type: Date,
        required: false,
    },
    country: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    likedProducts: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
    deletedProducts: {
        type: [mongoose.Types.ObjectId],
        default: [],
    },
});

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    imageLink: {
        type: [String],
        required: true,
    },
});

const output = () => {
    const User = async (uri: string) => {
        const connection = await mongooseConnect(uri);
        const response = connection.model('User', userSchema);
        return response;
    };

    const Product = async (uri: string) => {
        const connection = await mongooseConnect(uri);
        const response = connection.model('Product', productSchema);
        return response;
    };

    return {User, Product};
};

module.exports = output;
