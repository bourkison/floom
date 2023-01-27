/* Amplify Params - DO NOT EDIT
	AUTH_FLOOMCOGNITO_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const MongooseModels = require('/opt/nodejs/models');
import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {Model, Types} from 'mongoose';

let MONGODB_URI: string;

type UserDocData = {
    email: string;
    name: string;
    gender: string;
    dob: Date;
    country: string;
    likedProducts?: Types.ObjectId[];
    deletedProducts?: Types.ObjectId[];
};

type ProductType = {
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
    likedBy: Types.ObjectId[];
    likedAmount: number;
    deletedBy: Types.ObjectId[];
    deletedAmount: number;
};

const getUser = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const email = event.pathParameters.proxy;
    const authEmail = event.requestContext.authorizer.claims.email;
    const User: Model<UserDocData> = await MongooseModels().User(MONGODB_URI);

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    if (email !== authEmail) {
        response = {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `${authEmail} does not have permission to access ${email}`,
            }),
        };

        return response;
    }

    try {
        const result = await User.findOne(
            {email: email},
            {
                email: 1,
                name: 1,
                gender: 1,
                dob: 1,
                country: 1,
                currency: 1,
            },
        ).exec();

        if (!result) {
            response = {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    errorMessage: 'User not found',
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
            body: JSON.stringify({
                success: true,
                data: result.toObject(),
            }),
        };
    } catch {
        // TODO: Handle error and return appropriate response.
        return response;
    }

    return response;
};

const updateUser = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const authEmail = event.requestContext.authorizer.claims.email;
    const userObject: UserDocData = JSON.parse(event.body)?.user;

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    if (userObject.email !== authEmail) {
        response = {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `${authEmail} does not have permission to update ${userObject.email}`,
            }),
        };

        return response;
    }

    // TODO: Update birthdate, email, gender, locale, name in Cognito first.

    const User: Model<UserDocData> = await MongooseModels().User(MONGODB_URI);

    await User.findOneAndUpdate(
        {email: authEmail},
        {...userObject, dob: new Date(userObject.dob)},
        {
            upsert: false,
        },
    );

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            success: true,
            message: `User updated with ${userObject}`,
        }),
    };

    return response;
};

const deleteUser = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const authEmail = event.requestContext.authorizer.claims.email;

    const User: Model<UserDocData> = await MongooseModels().User(MONGODB_URI);
    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            success: false,
        }),
    };

    if (!authEmail) {
        response = {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `Unauthorized`,
            }),
        };

        return response;
    }

    try {
        const cognito = new aws.CognitoIdentityServiceProvider();
        await cognito
            .adminDeleteUser({
                Username: authEmail,
                UserPoolId: process.env.AUTH_FLOOMCOGNITO_USERPOOLID,
            })
            .promise();
    } catch (err) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: err.message || 'Error deleting in Cognito',
            }),
        };

        return response;
    }

    // Next delete user in MongoDB.
    try {
        // Get liked and deleted products so we can pull this user from array
        const {likedProducts, deletedProducts, _id} = await User.findOne(
            {email: authEmail},
            {likedProducts: 1, deletedProducts: 1, _id: 1},
        ).lean();

        const pullFromLiked = async () => {
            return await Product.updateMany(
                {_id: {$in: likedProducts}},
                {likedBy: {$pull: _id}, likedAmount: {$inc: -1}},
            );
        };

        const pullFromDeleted = async () => {
            return await Product.updateMany(
                {_id: {$in: deletedProducts}},
                {deletedBy: {$pull: _id}, deletedAmount: {$inc: -1}},
            );
        };

        const deleteUser = async () => {
            return await User.deleteOne({email: authEmail});
        };

        await Promise.allSettled([
            pullFromLiked(),
            pullFromDeleted(),
            deleteUser(),
        ]);
    } catch (err) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: err.message || 'Error deleting in DB',
            }),
        };
    }

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            success: true,
        }),
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
            response = await getUser(event);
            break;
        case 'PUT':
            response = await updateUser(event);
            break;
        case 'DELETE':
            response = await deleteUser(event);
            break;
    }

    return response;
};
