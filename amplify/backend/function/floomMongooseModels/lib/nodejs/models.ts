import mongoose, {Types} from 'mongoose';
import mongooseConnect from './mongoose-connection';
import {COUNTRIES, CURRENCIES} from './constants';

const COUNTRY_CODES = Object.values(COUNTRIES).map(c => c.code);
const CURRENCY_CODES = Object.values(CURRENCIES).map(c => c.code);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxLength: 256,
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
            enum: COUNTRY_CODES,
        },
        currency: {
            type: String,
            required: true,
            enum: CURRENCY_CODES,
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
        reports: {
            type: [mongoose.Types.ObjectId],
            default: [],
        },
    },
    {timestamps: true},
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: [
                {
                    amount: {
                        type: Number,
                        required: true,
                        minimum: 0,
                    },
                    saleAmount: {
                        type: Number,
                        required: true,
                        minimum: 0,
                    },
                    currency: {
                        type: String,
                        required: true,
                        enum: CURRENCY_CODES,
                    },
                },
            ],
            required: true,
        },
        link: {
            type: String,
            required: true,
            // Max length of a URL.
            maxLength: 2048,
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
        availableCountries: {
            type: [String],
            required: true,
            validate: {
                validator: function (countries: typeof COUNTRY_CODES) {
                    countries.forEach(c => {
                        if (!COUNTRY_CODES.includes(c)) {
                            return false;
                        }
                    });

                    return true;
                },
            },
        },
        // Assign a random number between 0 and 32,768 (16 bit int) to sort product by.
        rnd: {
            type: Number,
            default: () => {
                return Math.floor(Math.random() * 32_768);
            },
        },
        likedBy: {
            type: [Types.ObjectId],
            default: [],
        },
        likedCount: {
            type: Number,
            default: 0,
            minimum: 0,
        },
        deletedBy: {
            type: [Types.ObjectId],
            default: [],
        },
        deletedCount: {
            type: Number,
            default: 0,
            minimum: 0,
        },
        boughtBy: {
            type: [Types.ObjectId],
            default: [],
        },
        boughtCount: {
            type: Number,
            default: 0,
            minimum: 0,
        },
        reports: {
            type: [Types.ObjectId],
            default: [],
        },
        reportsCount: {
            type: Number,
            default: 0,
            minimum: 0,
        },
    },
    {timestamps: true},
);

const reportSchema = new mongoose.Schema(
    {
        createdBy: {
            type: Types.ObjectId,
            required: true,
        },
        product: {
            type: Types.ObjectId,
            required: true,
        },
        message: {
            type: String,
            required: true,
            maxLength: 1000,
        },
        type: {
            type: String,
            required: true,
            enum: ['inappropriate', 'broken', 'other'],
        },
        reviewed: {
            type: Boolean,
            default: false,
        },
        resolved: {
            type: Boolean,
            default: false,
        },
    },
    {timestamps: true},
);

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

    const Report = async (uri: string) => {
        const connection = await mongooseConnect(uri);
        const response = connection.model('Report', reportSchema);
        return response;
    };

    return {User, Product, Report};
};

module.exports = output;
