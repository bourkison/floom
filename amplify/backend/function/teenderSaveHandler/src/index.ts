import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, Types, UpdateQuery} from 'mongoose';

let MONGODB_URI: string;

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

const createSaveOrDelete = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const type = event.queryStringParameters.type || 'save';
    const email = event.requestContext.authorizer.claims.email;
    const _id = event.pathParameters.proxy;

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
        let update: UpdateQuery<UserType> =
            type === 'save'
                ? {$addToSet: {likedProducts: _id}}
                : {$addToSet: {deletedProducts: _id}};
        await User.findOneAndUpdate({email: email}, update);

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: true}),
        };

        return response;
    } catch (err) {
        // TODO: Handle error and return appropriate response.
        console.error(err);
        return response;
    }
};

const deleteSaveOrDelete = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const type = event.queryStringParameters.type || 'save';
    const email = event.requestContext.authorizer.claims.email;
    const _id = event.pathParameters.proxy;

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
        let update: UpdateQuery<UserType> =
            type == 'save'
                ? {$pull: {likedProducts: _id}}
                : {$pull: {deletedProducts: _id}};

        await User.findOneAndUpdate({email: email}, update);

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: true}),
        };

        return response;
    } catch (err) {
        console.error(err);
        return response;
    }
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
            response = await deleteSaveOrDelete(event);
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
