const mongoose = require('mongoose');
const mongooseConnect = require('./mongoose-connection');

const userSchema = mongoose.Schema({
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
});

const productSchema = mongoose.Schema({
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
    imageLink: [
        {
            type: String,
            required: true,
        },
    ],
});

module.exports = () => {
    const User = async uri => {
        const connection = await mongooseConnect(uri);
        const response = await connection.model('User', userSchema);
        return response;
    };

    const Product = async uri => {
        const connection = await mongooseConnect(uri);
        const response = await connection.model('Product', productSchema);
    };

    return {User, Product};
};
