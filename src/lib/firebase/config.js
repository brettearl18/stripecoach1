"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = exports.auth = exports.firebaseConfig = void 0;
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var storage_1 = require("firebase/storage");
exports.firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL // optional, if you use RTDB
};
// Initialize Firebase only if it hasn't been initialized
var app = (0, app_1.getApps)().length === 0 ? (0, app_1.initializeApp)(exports.firebaseConfig) : (0, app_1.getApps)()[0];
// Initialize services
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
exports.default = app;
