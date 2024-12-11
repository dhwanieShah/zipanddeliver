// const mongoose = require("mongoose");

// let zipAndDeliverDatabase = null;
// let imerferenceDatabase = null;

// exports.mongo_connection = async () => {
//     mongoose.set("debug", true);

//     try {
//         if (!imerferenceDatabase) {
//             console.log("Connecting to imerferenceDatabase...");
//             imerferenceDatabase = await mongoose.createConnection(process.env.IMERFERENCES_DATABASE_URL);
//             console.log("Connected to imerferenceDatabase");
//         }

//         if (!zipAndDeliverDatabase) {
//             console.log("Connecting to zipAndDeliverDatabase...");
//             zipAndDeliverDatabase = await mongoose.createConnection(process.env.DB_MONGO_URL);
//             console.log("Connected to zipAndDeliverDatabase");
//         }

//         console.log("MongoDB Connections Initialized!");
//     } catch (err) {
//         console.error("MongoDB Database Connection Error", err);
//     }
// };

// exports.getConnections = () => ({
//     zipAndDeliverDatabase,
//     imerferenceDatabase,
// });

const mongoose = require('mongoose');

// Connection URIs
const dbURIs = {
    imerferenceDatabase: process.env.IMERFERENCES_DATABASE_URL,
    zipAndDeliverDatabase: process.env.DB_MONGO_URL,
};

// Connection cache
const connections = {};

// Function to get or create a connection
const getConnection = (dbName) => {
    console.log("🚀 ~ getConnection ~ dbName:", dbName); // Log dbName
    if (!dbURIs[dbName]) {
        console.error(`No URI found for database: ${dbName}`);
        throw new Error(`Invalid database name: ${dbName}`);
    }
    if (!connections[dbName]) {
        connections[dbName] = mongoose.createConnection(dbURIs[dbName]);
        console.log(`New connection created for ${dbName}`);
    } else {
        console.log(`Reusing existing connection for ${dbName}`);
    }
    return connections[dbName];
};

module.exports = { getConnection };
