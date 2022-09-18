import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, Types, FilterQuery} from 'mongoose';

let MONGODB_URI: string;

type ProductType = {
    _id: Types.ObjectId;
    title: string;
    price: number;
    link: string;
    imageLink: string[];
    createdAt: Date;
    updatedAt: Date;
};

type UserType = {
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

const queryUnsavedProduct = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const email = event.requestContext?.authorizer?.claims?.email || undefined;
    const loadAmount = parseInt(event.queryStringParameters.loadAmount) || 5;
    const startAt = event.queryStringParameters.startAt || '';

    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );
    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    try {
        const user = (
            await User.findOne(
                {email},
                {email: 1, likedProducts: 1, deletedProducts: 1},
            )
        ).toObject();

        if (!user) {
            response = {
                statusCode: 403,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({success: false, message: 'Unknown user'}),
            };
        }

        const excludedProductsArr = [
            ...user.likedProducts,
            ...user.deletedProducts,
        ];

        let query: FilterQuery<ProductType> = {
            _id: {
                $nin: excludedProductsArr,
            },
        };

        if (startAt) {
            // As we order by createdAt, we need to find the createdAt field of startAt element,
            // then filter for when greater than that value.
            const startAtCreatedAt = (
                await Product.findOne(
                    {_id: new Types.ObjectId(startAt)},
                    {createdAt: 1},
                )
            ).createdAt;

            // Then add query for where exercise is greater than createdAt OR its equal and ID is bigger.
            query.$or = [
                {
                    createdAt: {$lt: startAtCreatedAt},
                },
                {
                    createdAt: startAtCreatedAt,
                    _id: {$lt: new Types.ObjectId(startAt)},
                },
            ];
        }

        const products = await Product.find(query, {
            title: 1,
            price: 1,
            link: 1,
            imageLink: 1,
        })
            .sort({$createdAt: -1, _id: -1})
            .limit(loadAmount);

        if (!products || !products.length) {
            response = {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'No products found',
                }),
            };

            return response;
        }

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: true, data: products}),
        };

        return response;
    } catch (err) {
        // TODO: Handle error and return appropriate response.
        console.error(err);
        return response;
    }
};

const querySavedProduct = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const email = event.requestContext?.authorizer?.claims?.email || undefined;
    const loadAmount = parseInt(event.queryStringParameters.loadAmount) || 5;
    const startAt = event.queryStringParameters.startAt || '';

    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    if (!email) {
        response = {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'Not logged in'}),
        };
        return response;
    }

    const products = (
        await User.findOne(
            {email: email},
            {likedProducts: {$slice: -loadAmount}},
        )
    ).toObject().likedProducts;

    if (!products || !products.length) {
        response = {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'No products found',
            }),
        };
        return response;
    }

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: true, data: products}),
    };

    return response;
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['MONGODB_URI'].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();

    MONGODB_URI = Parameters[0].Value;

    let response: APIGatewayProxyResult;

    switch (event.httpMethod) {
        case 'GET':
            const type = event.queryStringParameters.type || 'unsaved';
            if (type === 'saved') {
                response = await querySavedProduct(event);
            } else if (type === 'unsaved') {
                response = await queryUnsavedProduct(event);
            } else {
                response = {
                    statusCode: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': '*',
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Unknown GET type',
                    }),
                };
            }
            break;
        default:
            response = {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Unknown HTTP method',
                }),
            };
            break;
    }

    return response;
};
