import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, UpdateQuery} from 'mongoose';
import {UserType, ProductType} from './types';
import {Update} from 'aws-sdk/clients/dynamodb';

let MONGODB_URI: string;

const createSaveOrDelete = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const type = event.queryStringParameters.type || 'save';
    const email = event.requestContext.authorizer.claims.email;
    const _id = event.pathParameters.proxy;

    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);
    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    const updateUser = async () => {
        try {
            let update: UpdateQuery<UserType> =
                type === 'save'
                    ? {
                          $addToSet: {likedProducts: _id},
                          $pull: {deletedProducts: _id},
                      }
                    : {
                          $addToSet: {deletedProducts: _id},
                          $pull: {likedProducts: _id},
                      };
            await User.findOneAndUpdate({email: email}, update);
        } catch (err) {
            // TODO: Handle error and return appropriate response.
            console.error(err);
            throw err;
        }
    };

    const updateProduct = async () => {
        try {
            // First get user ID
            const {_id: userId} = await User.findOne({email: email});
            let update: UpdateQuery<ProductType> =
                type === 'save'
                    ? {$push: {likedBy: userId}, $inc: {likedCount: 1}}
                    : {$push: {deletedBy: userId}, $inc: {deletedCount: 1}};

            await Product.findOneAndUpdate({_id}, update);
        } catch (err) {
            // TODO: Handle error and return appropriate response.
            console.error(err);
            return response;
        }
    };

    // TODO: If error in update user, and not in update product - undo changes done to product.

    await Promise.allSettled([updateUser(), updateProduct()]);

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: true}),
    };

    return response;
};

const deleteSaveOrDelete = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const type = event.queryStringParameters.type || 'save';
    const email = event.requestContext.authorizer.claims.email;
    const _id = event.pathParameters.proxy;

    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);
    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    const updateUser = async () => {
        try {
            let update: UpdateQuery<UserType> =
                type === 'save'
                    ? {$pull: {likedProducts: _id}}
                    : {$pull: {deletedProducts: _id}};

            await User.findOneAndUpdate({email: email}, update);
        } catch (err) {
            console.error(err);
            response = {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({success: false, message: 'Update error'}),
            };
            throw err;
        }
    };

    const updateProduct = async () => {
        try {
            // First get user ID
            const {_id: userId} = await User.findOne({email: email});
            let update: UpdateQuery<ProductType> =
                type === 'save'
                    ? {$pull: {likedBy: userId}, $inc: {likedCount: -1}}
                    : {$pull: {deletedBy: userId}, $inc: {deletedCount: -1}};

            await Product.findOneAndUpdate({_id}, update);
        } catch (err) {
            console.error('Error updating product, continuing', err);
        }
    };

    await Promise.allSettled([updateUser(), updateProduct()]);

    // TODO: If error in update user, and not in update product - undo changes done to product.

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: true}),
    };

    return response;
};

const deleteAllDeletes = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const email = event.requestContext.authorizer.claims.email;

    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);
    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    try {
        const updateUser = async () => {
            await User.findOneAndUpdate({email}, {deletedProducts: []});
        };

        const updateProducts = async () => {
            const {deletedProducts, _id: userId} = await User.findOne(
                {email},
                {deletedProducts: 1},
            );

            await Product.updateMany(
                {_id: {$in: deletedProducts}},
                {$pull: {deletedBy: userId}, $inc: {deletedCount: -1}},
            );
        };

        await Promise.allSettled([updateUser(), updateProducts()]);

        // TODO: If error in update user, and not in update product - undo changes done to product.

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: true}),
        };
    } catch (err) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'Update error'}),
        };
    }

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
        case 'POST':
            response = await createSaveOrDelete(event);
            break;
        case 'DELETE':
            const deleteAll =
                event?.queryStringParameters?.deleteAll === 'true' || false;
            response = deleteAll
                ? await deleteAllDeletes(event)
                : await deleteSaveOrDelete(event);
            break;
        default:
            response = {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Unknown HTTP method',
                }),
            };
    }

    return response;
};
