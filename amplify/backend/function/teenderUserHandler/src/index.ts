const MongooseModels = require('/opt/nodejs/models');
import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {Document, Model} from 'mongoose';

let MONGODB_URI: string;

type UserDocData = {
    email: string;
    name: string;
    gender: string;
    dob: Date;
    country: string;
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
        return response;
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
        case 'GET':
            response = await getUser(event);
            break;
    }

    return response;
};
