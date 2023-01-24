import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model} from 'mongoose';
import {ProductType} from './types';
import {queryUnsavedProduct} from './unsaved';
import {querySavedOrDeletedProduct} from './saved';

export const MAX_LOAD_AMOUNT = 50;

const getProduct = async (
    event: APIGatewayEvent,
    MONGODB_URI: string,
): Promise<APIGatewayProxyResult> => {
    const _id = event.pathParameters.proxy;

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

    const product = await Product.findById(_id).lean();

    if (!product) {
        response = {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'No product found'}),
        };
        return response;
    }

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: true, data: product}),
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

    const MONGODB_URI = Parameters[0].Value;

    let response: APIGatewayProxyResult;

    switch (event.httpMethod) {
        case 'GET':
            const proxy = event.pathParameters?.proxy || '';
            if (proxy) {
                response = await getProduct(event, MONGODB_URI);
            } else {
                const type = event.queryStringParameters.type || 'unsaved';
                if (type === 'saved' || type === 'deleted') {
                    response = await querySavedOrDeletedProduct(
                        event,
                        type,
                        MONGODB_URI,
                    );
                } else if (type === 'unsaved') {
                    response = await queryUnsavedProduct(event, MONGODB_URI);
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
