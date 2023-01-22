import mongoose, {Types} from 'mongoose';
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
    name: {
        type: String,
        required: true,
    },
    price: {
        amount: {
            type: Number,
            required: true,
        },
        saleAmount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
    },
    link: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        required: true,
    },
    colors: {
        type: [String],
        default: [],
    },
    categories: {
        type: [String],
        default: [],
    },
    gender: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
    vendorProductId: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    likedBy: {
        type: [Types.ObjectId],
        default: [],
    },
    likedCount: {
        type: Number,
        default: 0,
    },
    deletedBy: {
        type: [Types.ObjectId],
        default: [],
    },
    deletedCount: {
        type: Number,
        default: 0,
    },
    boughtBy: {
        type: [Types.ObjectId],
        default: [],
    },
    boughtCount: {
        type: [Number],
        default: 0,
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
