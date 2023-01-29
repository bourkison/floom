import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {Model, Types} from 'mongoose';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';

type ProductType = {
    reports: Types.ObjectId[];
    reportCount: number;
    _id: Types.ObjectId;
};

type UserType = {
    reports: Types.ObjectId[];
    _id: Types.ObjectId;
};

type ReportType = {
    createdBy: Types.ObjectId;
    product: Types.ObjectId;
    message: string;
    type: 'inappropriate' | 'broken' | 'other';
};

// TODO: Could add some logic preventing users from creating too many reports on the same product.
const createReport = async (
    event: APIGatewayEvent,
    MONGODB_URI: string,
): Promise<APIGatewayProxyResult> => {
    const _id = event.pathParameters.proxy;
    const email = event.requestContext?.authorizer?.claims?.email;
    const reportObj: ReportType = JSON.parse(event.body);

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    if (!_id) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'No product ID provided',
            }),
        };
        return response;
    }

    if (!email) {
        response = {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'No email',
            }),
        };
        return response;
    }

    const Report: Model<ReportType> = await MongooseModels().Report(
        MONGODB_URI,
    );
    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );
    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);

    let productId: Types.ObjectId;
    let userId: Types.ObjectId;

    // Check that product and user exists.
    const verifyProduct = async () => {
        productId = (
            await Product.findOne(
                {
                    _id: new Types.ObjectId(_id),
                },
                {_id: 1},
            ).lean()
        )?._id;
    };

    const verifyUser = async () => {
        userId = (await User.findOne({email}, {_id: 1}).lean())?._id;
    };

    await Promise.allSettled([verifyProduct(), verifyUser()]);

    if (!productId) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'Product not found',
            }),
        };

        return response;
    } else if (!userId) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'User not found',
            }),
        };

        return response;
    }

    const report = new Report({
        ...reportObj,
        createdBy: userId,
        product: productId,
    });

    try {
        await report.save();
    } catch (err) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: err.message,
            }),
        };

        return response;
    }

    const updateProduct = async () => {
        await Product.updateOne(
            {_id: productId},
            {$push: {reports: report._id}, $inc: {reportsCount: 1}},
            {runValidators: true},
        );
    };

    const updateUser = async () => {
        await User.updateOne({_id: userId}, {$push: {reports: report._id}});
    };

    await Promise.allSettled([updateProduct(), updateUser()]);

    response = {
        statusCode: 201,
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

    const MONGODB_URI = Parameters[0].Value;

    let response: APIGatewayProxyResult;

    switch (event.httpMethod) {
        case 'POST':
            response = await createReport(event, MONGODB_URI);
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
