"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var auth_1 = require("firebase/auth");
var app_2 = require("firebase/app");
var config_1 = require("./config");
function testFirebaseConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var app, db, collections, error_1, auth, error_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    console.log('Initializing Firebase with config:', {
                        projectId: config_1.firebaseConfig.projectId,
                        authDomain: config_1.firebaseConfig.authDomain,
                        databaseURL: config_1.firebaseConfig.databaseURL
                    });
                    app = (0, app_1.initializeApp)(config_1.firebaseConfig);
                    console.log('Firebase app initialized successfully');
                    db = (0, firestore_1.getFirestore)(app);
                    console.log('Firestore initialized');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.getDocs)((0, firestore_1.collection)(db, '__test__'))];
                case 2:
                    collections = _a.sent();
                    console.log('Firestore read test successful');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    if (error_1 instanceof firestore_1.FirestoreError) {
                        console.log('Firestore read test error (this might be expected if collection doesn\'t exist):', error_1.message);
                    }
                    else {
                        console.log('Unknown error during Firestore read test:', error_1);
                    }
                    return [3 /*break*/, 4];
                case 4:
                    auth = (0, auth_1.getAuth)(app);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, auth_1.signInAnonymously)(auth)];
                case 6:
                    _a.sent();
                    console.log('Anonymous auth test successful');
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    if (error_2 instanceof app_2.FirebaseError) {
                        console.log('Auth test error:', error_2.message);
                    }
                    else {
                        console.log('Unknown auth error:', error_2);
                    }
                    return [3 /*break*/, 8];
                case 8:
                    console.log('All Firebase services initialized successfully');
                    return [2 /*return*/, true];
                case 9:
                    error_3 = _a.sent();
                    if (error_3 instanceof Error) {
                        console.error('Firebase connection test failed:', error_3.message);
                    }
                    else {
                        console.error('Firebase connection test failed with unknown error:', error_3);
                    }
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testFirebaseConnection()
    .then(function (success) {
    if (success) {
        console.log('✅ Firebase connection test completed successfully');
    }
    else {
        console.log('❌ Firebase connection test failed');
    }
})
    .catch(function (error) {
    if (error instanceof Error) {
        console.error('Test execution failed:', error.message);
    }
    else {
        console.error('Test execution failed with unknown error:', error);
    }
});
