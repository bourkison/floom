import aws from 'aws-sdk';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Document, Model} from 'mongoose';
import {ScheduledEvent} from 'aws-lambda';
import {faker} from '@faker-js/faker';

let MONGODB_URI: string;

type ProductType = {
    title: string;
    price: number;
    link: string;
    imageLink: string[];
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event: ScheduledEvent) => {
    console.log('EVENT:', event);

    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['MONGODB_URI'].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();

    MONGODB_URI = Parameters[0].Value;

    let payload: ProductType[] = [];

    for (let i = 0; i < 100; i++) {
        let product: ProductType = {
            title: faker.vehicle.vehicle(),
            price: Math.floor(Math.random() * 100000) / 100,
            link: 'https://www.strenive.com',
            imageLink: [],
        };

        for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
            product.imageLink.push(
                faker.image.animals(400, Math.floor(400 / 0.9), true),
            );
        }

        payload.push(product);
    }

    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    await Product.insertMany(payload);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({success: true, message: 'Successful!'}),
    };
};
