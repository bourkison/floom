"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
// @ts-ignore
const models_1 = __importDefault(require("/opt/nodejs/models"));
let MONGODB_URI;
const createLike = async (event) => {
    const type = event.queryStringParameters.type || 'like';
    const email = event.requestContext.authorizer.claims.email;
    const _id = event.pathParameters.proxy;
    const User = await (0, models_1.default)().User(MONGODB_URI);
    let response = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ success: false }),
    };
    try {
        let update = type === 'like'
            ? { $push: { likedProducts: _id } }
            : { $push: { deletedProducts: _id } };
        await User.findOneAndUpdate({ email: email }, update);
        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ success: true }),
        };
        return response;
    }
    catch (err) {
        // TODO: Handle error and return appropriate response.
        console.error(err);
        return response;
    }
};
/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    const { Parameters } = await new aws_sdk_1.default.SSM()
        .getParameters({
        Names: ['MONGODB_URI'].map(secretName => process.env[secretName]),
        WithDecryption: true,
    })
        .promise();
    MONGODB_URI = Parameters[0].Value;
    let response;
    switch (event.httpMethod) {
        case 'POST':
            response = await createLike(event);
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
