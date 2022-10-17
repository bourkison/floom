import mongoose from 'mongoose';
let conn: Promise<mongoose.Connection> | null = null;

export default async function (uri: string) {
    if (conn === null) {
        conn = mongoose.createConnection(uri).asPromise();
    }

    // Close the Mongoose connection, when receiving SIGINT
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Force to close the MongoDB connection after SIGINT');
            process.exit(0);
        });
    });

    return await conn;
}
