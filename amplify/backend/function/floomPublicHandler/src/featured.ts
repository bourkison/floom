import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ProductType} from './types';
import {Model} from 'mongoose';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';

const SAMPLE_AMOUNT = 25;
const genders = ['male', 'female'];

export const getFeaturedProduct = async (
    event: APIGatewayEvent,
    MONGODB_URI: string,
): Promise<APIGatewayProxyResult> => {
    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    const filteredGender = JSON.parse(event.body)?.filteredGender
        ? JSON.parse(event.body).filteredGender
        : genders[Math.floor(Math.random()) * genders.length];

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    const products = await Product.find(
        {gender: filteredGender},
        {
            _id: 1,
            name: 1,
            price: 1,
            link: 1,
            images: 1,
            colors: 1,
            categories: 1,
            gender: 1,
            brand: 1,
            inStock: 1,
            description: 1,
            likedCount: 1,
            deletedCount: 1,
        },
    )
        .sort({likedCount: -1})
        .limit(SAMPLE_AMOUNT)
        .lean();

    if (!products.length) {
        response = {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'Products not found',
            }),
        };
    }

    const returnedProduct =
        products[Math.floor(Math.random() * products.length)];

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            success: true,
            data: returnedProduct,
            type: 'topliked',
            filter: filteredGender,
        }),
    };

    return response;
};
