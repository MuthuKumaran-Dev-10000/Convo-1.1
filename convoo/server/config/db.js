const admin = require('firebase-admin');
const serviceAccount = require('./convo-config.json'); 


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://convo-be05d-default-rtdb.firebaseio.com',
});


const db = admin.database();

module.exports = db;
