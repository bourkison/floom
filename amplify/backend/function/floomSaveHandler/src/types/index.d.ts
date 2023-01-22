import {Types} from 'mongoose';

export type ProductType = {
    name: string;
    price: {
        amount: number;
        saleAmount: number;
        currency: string;
    };
    link: string;
    images: string[];
    colors: string[];
    categories: string[];
    gender: string;
    brand: string;
    vendorProductId: string;
    inStock: boolean;
    likedBy: string[];
    likedCount: number;
    deletedBy: string[];
    deletedCount: number;
    boughtBy: string[];
    boughtCount: number;
};

type UserType = {
    _id: Types.ObjectId;
    email: string;
    name: string;
    gender: string;
    dob: Date;
    country: string;
    likedProducts: string[];
    deletedProducts: string[];
};
