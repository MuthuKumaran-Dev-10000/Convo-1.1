import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyB-LvuCHGNNUYWyQte_kvYHcZZM8Sbxxkg",
    authDomain: "convo-be05d.firebaseapp.com",
    databaseURL: "https://convo-be05d-default-rtdb.firebaseio.com",
    projectId: "convo-be05d",
    storageBucket: "convo-be05d.appspot.com",
    messagingSenderId: "230404052463",
    appId: "1:230404052463:web:5676d99c4f64e4232ed21a",
    measurementId: "G-3YESMGCVBP"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
