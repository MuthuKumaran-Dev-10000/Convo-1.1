const admin = require('firebase-admin');
const serviceAccount = require('./convo-be05d-firebase-adminsdk-hh4xq-503eb4377e.json'); 


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://convo-be05d-default-rtdb.firebaseio.com',
});


const db = admin.database();

module.exports = db;

