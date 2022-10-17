import aws from 'aws-sdk';
import {ScheduledEvent} from 'aws-lambda';
import {Model} from 'mongoose';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';

import hm from './hm';
import {ProductType} from './types';

exports.handler = async (event: ScheduledEvent) => {
    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['MONGODB_URI', 'HM_API_KEY'].map(
                secretName => process.env[secretName],
            ),
            WithDecryption: true,
        })
        .promise();

    const secrets = Parameters.reduce((object, param) => {
        console.log('PARAM:', param);
        console.log('OBJECT:', object);

        return {...object, [param.Name]: param.Value};
    }, {});

    console.log('secrets', secrets);

    const HM_API_KEY = secrets[process.env['HM_API_KEY']];
    const MONGODB_URI = secrets[process.env['MONGODB_URI']];

    console.log('MONGODB', MONGODB_URI, 'HM_API', HM_API_KEY);

    const products = await hm(HM_API_KEY);
    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    console.log('Saved products:', products.length);

    const response = await Product.bulkWrite(
        products.map(p => {
            return {
                updateOne: {
                    filter: {vendorProductId: p.vendorProductId},
                    update: {$set: p},
                    upsert: true,
                },
            };
        }),
    );

    return JSON.stringify(response);
};
