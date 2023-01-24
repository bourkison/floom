import {Types} from 'mongoose';

export type ProductType = {
    _id: Types.ObjectId;
    name: string;
    price: {
        amount: number;
        saleAmount: number;
        currency: string;
    }[];
    link: string;
    images: string[];
    colors: string[];
    categories: string[];
    gender: string;
    brand: string;
    vendorProductId: string;
    inStock: boolean;
    description: string;
    rnd: number;
    availableCountries: string[];
};

export type UserType = {
    _id: Types.ObjectId;
    email: string;
    name: string;
    gender: string;
    dob: Date;
    country: string;
    likedProducts: Types.ObjectId[];
    deletedProducts: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
};
