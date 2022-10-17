"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_connection_1 = __importDefault(require("./mongoose-connection"));
const userSchema = new mongoose_1.default.Schema({
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
        type: [mongoose_1.default.Types.ObjectId],
        default: [],
    },
    deletedProducts: {
        type: [mongoose_1.default.Types.ObjectId],
        default: [],
    },
});
const productSchema = new mongoose_1.default.Schema({
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
    const User = async (uri) => {
        const connection = await (0, mongoose_connection_1.default)(uri);
        const response = connection.model('User', userSchema);
        return response;
    };
    const Product = async (uri) => {
        const connection = await (0, mongoose_connection_1.default)(uri);
        const response = connection.model('Product', productSchema);
        return response;
    };
    return { User, Product };
};
module.exports = output;
