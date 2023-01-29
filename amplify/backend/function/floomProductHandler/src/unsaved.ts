import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ProductType, UserType} from './types';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, Types, FilterQuery} from 'mongoose';
import {MAX_LOAD_AMOUNT} from '.';
import {buildQueryWithFilters} from './services';

export const queryUnsavedProduct = async (
    event: APIGatewayEvent,
    MONGODB_URI: string,
): Promise<APIGatewayProxyResult> => {
    const email = event.requestContext?.authorizer?.claims?.email || undefined;
    const loadAmount = parseInt(event.queryStringParameters.loadAmount) || 5;
    const startAt = event.queryStringParameters.startAt || '';

    const excludeDeleted =
        event.queryStringParameters.excludeDeleted === 'true' || false;
    const excludeSaved =
        event.queryStringParameters.excludeSaved === 'true' || false;
    const ordered = event.queryStringParameters.ordered === 'true' || false;

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

    if (loadAmount > MAX_LOAD_AMOUNT) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `Max load amount is ${MAX_LOAD_AMOUNT}`,
            }),
        };

        return response;
    }

    if (loadAmount <= 0) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `Load amount is 0 or less`,
            }),
        };

        return response;
    }

    try {
        const user = await User.findOne(
            {email},
            {email: 1, likedProducts: 1, deletedProducts: 1},
        ).lean();

        if (!user) {
            response = {
                statusCode: 403,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({success: false, message: 'Unknown user'}),
            };

            return response;
        }

        let excludedProductsArr: Types.ObjectId[] = [];

        if (excludeDeleted) {
            excludedProductsArr = [
                ...excludedProductsArr,
                ...user.deletedProducts,
            ];
        }

        if (excludeSaved) {
            excludedProductsArr = [
                ...excludedProductsArr,
                ...user.likedProducts,
            ];
        }

        // Build out filtered query.
        let query: FilterQuery<ProductType> = {
            _id: {
                $nin: excludedProductsArr,
            },
        };

        if (startAt && ordered) {
            const {rnd} = await Product.findById(
                new Types.ObjectId(startAt),
            ).lean();

            query = {
                ...query,
                _id: {
                    ...query._id,
                    $lt: new Types.ObjectId(startAt),
                },
                rnd: {
                    $lt: rnd,
                },
            };
        }

        query = buildQueryWithFilters(query, event);

        let products: ProductType[] = [];

        if (ordered) {
            products = await Product.find<ProductType>(query, {
                _id: 1,
                name: 1,
                vendorProductId: 1,
                brand: 1,
                categories: 1,
                colors: 1,
                gender: 1,
                images: 1,
                inStock: 1,
                link: 1,
                price: 1,
                availableCountries: 1,
                deleted: {
                    $in: [user._id, '$deletedBy'],
                },
                saved: {
                    $in: [user._id, '$likedBy'],
                },
            })
                .sort({rnd: -1, _id: -1})
                .limit(loadAmount)
                .lean();
        } else {
            products = await Product.aggregate<ProductType>([
                {$match: query},
                {$sample: {size: loadAmount}},
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        vendorProductId: 1,
                        brand: 1,
                        categories: 1,
                        colors: 1,
                        gender: 1,
                        images: 1,
                        inStock: 1,
                        link: 1,
                        price: 1,
                        availableCountries: 1,
                        deleted: {
                            $in: [user._id, '$deletedBy'],
                        },
                        saved: {
                            $in: [user._id, '$likedBy'],
                        },
                    },
                },
            ]);
        }

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

        // If we have loaded less than we wanted, we know that
        // we have loaded everything and there is nothing more to load.
        const moreToLoad = !(products.length < loadAmount);

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                data: products,
                __totalLength: 'unknown',
                __moreToLoad: moreToLoad,
                __loaded: products.length,
            }),
        };

        return response;
    } catch (err) {
        // TODO: Handle error and return appropriate response.
        console.error(err);
        return response;
    }
};
