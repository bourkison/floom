const MongooseModels = require('/opt/nodejs/models');
import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {Model} from 'mongoose';

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
    }

    return response;
};
