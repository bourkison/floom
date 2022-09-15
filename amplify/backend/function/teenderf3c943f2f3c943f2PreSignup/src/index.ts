import aws from 'aws-sdk';
import {PreSignUpTriggerEvent} from 'aws-lambda';
const MongooseModels = require('/opt/nodejs/models');

let MONGODB_URI: string;

type TUser = {
    name: string;
    email: string;
    gender: 'male' | 'female' | 'other';
    dob: Date;
    country: string;
};

exports.handler = async (
    event: PreSignUpTriggerEvent,
): Promise<PreSignUpTriggerEvent> => {
    // @ts-ignore
    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['MONGODB_URI'].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();

    // @ts-ignore
    MONGODB_URI = Parameters[0].Value;

    const User = await MongooseModels().User(MONGODB_URI);
    const userObj: TUser = {
        name: 'Jane Citizen',
        gender: 'female',
        dob: new Date(),
        email: event.request.userAttributes.email,
        country: 'United Kingdom',
    };
    const user = new User(userObj);

    console.log('new user created v2:', userObj);

    await user.save();
    return event;
};
