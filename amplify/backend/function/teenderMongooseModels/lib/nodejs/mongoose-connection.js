const mongoose = require('mongoose');
let conn = null;

module.exports = async () => {
    if (conn === null) {
        conn = await mongoose.createConnection({
            useNewUrlParser: true,
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
            autoReconnect: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000,
            keepAlive: 30000,
            bufferMaxEntries: false,
        });
    } else {
        conn = await conn;
    }

    // Close the Mongoose connection, when receiving SIGINT
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Force to close the MongoDB connection after SIGINT');
            process.exit(0);
        });
    });

    return conn;
};
