import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, UpdateQuery} from 'mongoose';
import {UserType, ProductType} from './types';

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
    };

    let userInLiked: boolean;
    let userInDeleted: boolean;

    const updateProduct = async () => {
        // First get user ID
        const {_id: userId} = await User.findOne({email: email});

        // Check if user has liked or deleted.
        const product = (
            await Product.findOne(
                {_id},
                {
                    userInLiked: {$in: [userId, '$likedBy']},
                    userInDeleted: {$in: [userId, '$deletedBy']},
                },
            )
        ).toObject<{userInLiked: boolean; userInDeleted: boolean}>();

        userInLiked = product.userInLiked;
        userInDeleted = product.userInDeleted;

        let update: UpdateQuery<ProductType> =
            type === 'save'
                ? {
                      $addToSet: {likedBy: userId},
                      $pull: {deletedBy: userId},
                      $inc: {
                          likedCount: !userInLiked ? 1 : 0,
                          deletedCount: userInDeleted ? -1 : 0,
                      },
                  }
                : {
                      $addToSet: {deletedBy: userId},
                      $pull: {likedBy: userId},
                      $inc: {
                          deletedCount: !userInDeleted ? 1 : 0,
                          likedCount: userInLiked ? -1 : 0,
                      },
                  };

        await Product.findOneAndUpdate({_id}, update);
    };

    const [userResult, productResult] = await Promise.allSettled([
        updateUser(),
        updateProduct(),
    ]);

    // Undo product changes if user not successful but product is.
    if (
        userResult.status === 'rejected' &&
        productResult.status === 'fulfilled'
    ) {
        // First get user ID
        const {_id: userId} = await User.findOne({email: email});

        let update: UpdateQuery<ProductType> =
            type === 'save'
                ? {
                      $pull: {likedBy: userId},
                      $addToSet: userInDeleted ? {deletedBy: userId} : {},
                      $inc: {
                          likedCount: userInLiked ? -1 : 0,
                          deletedCount: userInDeleted ? 1 : 0,
                      },
                  }
                : {
                      $pull: {deletedBy: userId},
                      $addToSet: userInLiked ? {likedBy: userId} : {},
                      $inc: {
                          deletedCount: userInDeleted ? -1 : 0,
                          likedCount: userInLiked ? 1 : 0,
                      },
                  };

        await Product.findOneAndUpdate({_id}, update);
    }

    if (userResult.status === 'rejected') {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'Update error'}),
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
            productSuccess: productResult.status === 'fulfilled',
        }),
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
        let update: UpdateQuery<UserType> =
            type === 'save'
                ? {$pull: {likedProducts: _id}}
                : {$pull: {deletedProducts: _id}};

        await User.findOneAndUpdate({email: email}, update);
    };

    const updateProduct = async () => {
        const {_id: userId} = await User.findOne({email: email});
        let update: UpdateQuery<ProductType> =
            type === 'save'
                ? {$pull: {likedBy: userId}, $inc: {likedCount: -1}}
                : {$pull: {deletedBy: userId}, $inc: {deletedCount: -1}};

        await Product.findOneAndUpdate({_id}, update);
    };

    const [userResult, productResult] = await Promise.allSettled([
        updateUser(),
        updateProduct(),
    ]);

    // Undo product changes if user not successful but product is.
    if (
        userResult.status === 'rejected' &&
        productResult.status === 'fulfilled'
    ) {
        const {_id: userId} = await User.findOne({email: email});
        let update: UpdateQuery<ProductType> =
            type === 'save'
                ? {$addToSet: {likedBy: userId}, $inc: {likedCount: 1}}
                : {$addToSet: {deletedBy: userId}, $inc: {deletedCount: 1}};

        await Product.findOneAndUpdate({_id}, update);
    }

    if (userResult.status === 'rejected') {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'Update error'}),
        };

        return response;
    }

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

    const [userResult, productResult] = await Promise.allSettled([
        updateUser(),
        updateProducts(),
    ]);

    // Undo product changes if user not successful but product is.
    if (
        userResult.status === 'rejected' &&
        productResult.status === 'fulfilled'
    ) {
        const {deletedProducts, _id: userId} = await User.findOne(
            {email},
            {deletedProducts: 1},
        );

        await Product.updateMany(
            {_id: {$in: deletedProducts}},
            {$addToSet: {deletedBy: userId}, $inc: {deletedCount: 1}},
        );
    }

    if (userResult.status === 'rejected') {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'Update error'}),
        };

        return response;
    }

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
