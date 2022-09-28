/*
    To allow this function to connect to RDS:
    https://github.com/aws-amplify/amplify-cli/issues/32#issuecomment-656122079
*/
import aws from 'aws-sdk';
import {PreSignUpTriggerEvent} from 'aws-lambda';
import {Client} from 'pg';

let client: Client;

type User = {
    name: string;
    email: string;
    gender: 'male' | 'female' | 'other';
    dob: Date;
    country: string;
    created_at: Date;
    updated_at: Date;
};

exports.handler = async (
    event: PreSignUpTriggerEvent,
): Promise<PreSignUpTriggerEvent> => {
    // @ts-ignore
    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['PGPASSWORD'].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();

    const PGPASSWORD = Parameters[0].Value;

    if (!client) {
        client = new Client({
            user: process.env['PGUSER'],
            host: process.env['PGHOST'],
            database: process.env['PGDATABASE'],
            port: parseInt(process.env['PGPORT']),
            password: PGPASSWORD,
        });

        console.log('Connecting...');
        await client.connect();
        console.log('Connected');
    }

    const userObj: User = {
        name: event.request.userAttributes.name,
        gender: event.request.userAttributes.gender as
            | 'male'
            | 'female'
            | 'other',
        dob: new Date(event.request.userAttributes.birthdate),
        email: event.request.userAttributes.email,
        country: event.request.userAttributes.locale,
        created_at: new Date(),
        updated_at: new Date(),
    };

    const queryString = `
        INSERT INTO users (email, name, gender, dob, country, created_at, updated_at)
        VALUES
        ('${userObj.email}', '${userObj.name}', '${
        userObj.gender
    }', to_timestamp(${userObj.dob.getTime() / 1000}), '${
        userObj.country
    }', to_timestamp(${userObj.created_at.getTime() / 1000}), to_timestamp(${
        userObj.updated_at.getTime() / 1000
    }))
    `;

    console.log('Querying DB with', queryString);

    await client.query(queryString);

    console.log('Queried.');

    return event;
};
