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
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var config_1 = require("./config");
var data_validation_1 = require("./data-validation");
var error_handler_1 = require("./error-handler");
var auth_rules_1 = require("./auth-rules");
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var app, db, testCollection, snapshot, error_1, auth, userCred, error_2, testUser, validationResult, testPassword, passwordValidation, testEmail, i, attemptCheck, testError, handledError, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔄 Starting Firebase Installation Tests...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, , 12]);
                    // 1. Test Firebase Initialization
                    console.log('1️⃣ Testing Firebase Initialization...');
                    app = (0, app_1.initializeApp)(config_1.firebaseConfig);
                    console.log('✅ Firebase initialized successfully');
                    console.log('Config used:', {
                        projectId: config_1.firebaseConfig.projectId,
                        authDomain: config_1.firebaseConfig.authDomain
                    });
                    // 2. Test Firestore Connection
                    console.log('\n2️⃣ Testing Firestore Connection...');
                    db = (0, firestore_1.getFirestore)(app);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    testCollection = (0, firestore_1.collection)(db, 'users');
                    return [4 /*yield*/, (0, firestore_1.getDocs)(testCollection)];
                case 3:
                    snapshot = _a.sent();
                    console.log("\u2705 Firestore connected successfully. Found ".concat(snapshot.size, " documents in users collection"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log('❌ Firestore test failed:', error_1);
                    throw error_1;
                case 5:
                    // 3. Test Authentication
                    console.log('\n3️⃣ Testing Authentication...');
                    auth = (0, auth_1.getAuth)(app);
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 9, , 10]);
                    return [4 /*yield*/, (0, auth_1.signInAnonymously)(auth)];
                case 7:
                    userCred = _a.sent();
                    console.log('✅ Anonymous authentication successful');
                    console.log('User ID:', userCred.user.uid);
                    return [4 /*yield*/, (0, auth_1.signOut)(auth)];
                case 8:
                    _a.sent();
                    console.log('✅ Sign out successful');
                    return [3 /*break*/, 10];
                case 9:
                    error_2 = _a.sent();
                    console.log('❌ Authentication test failed:', error_2);
                    throw error_2;
                case 10:
                    // 4. Test Data Validation
                    console.log('\n4️⃣ Testing Data Validation...');
                    testUser = {
                        email: 'test@example.com',
                        role: 'coach',
                        name: 'Test User',
                        phone: '+1234567890'
                    };
                    validationResult = (0, data_validation_1.validateData)(testUser, data_validation_1.schemas.user);
                    console.log('Data Validation Result:', validationResult.isValid ? '✅ Valid' : '❌ Invalid');
                    if (!validationResult.isValid) {
                        console.log('Validation Errors:', validationResult.errors);
                    }
                    // 5. Test Password Validation
                    console.log('\n5️⃣ Testing Password Validation...');
                    testPassword = 'TestPass123!';
                    passwordValidation = (0, auth_rules_1.validatePassword)(testPassword);
                    console.log('Password Validation Result:', passwordValidation.isValid ? '✅ Valid' : '❌ Invalid');
                    if (!passwordValidation.isValid) {
                        console.log('Password Validation Errors:', passwordValidation.errors);
                    }
                    // 6. Test Rate Limiting
                    console.log('\n6️⃣ Testing Rate Limiting...');
                    testEmail = 'test@example.com';
                    for (i = 0; i < 6; i++) {
                        (0, auth_rules_1.incrementAuthAttempts)(testEmail);
                        attemptCheck = (0, auth_rules_1.checkAuthAttempts)(testEmail);
                        console.log("Attempt ".concat(i + 1, ": ").concat(attemptCheck.allowed ? '✅ Allowed' : '❌ Blocked'));
                        if (!attemptCheck.allowed) {
                            console.log("Lockout time remaining: ".concat(attemptCheck.timeLeft, " minutes"));
                        }
                    }
                    // 7. Test Error Handler
                    console.log('\n7️⃣ Testing Error Handler...');
                    testError = new Error('Test error');
                    handledError = (0, error_handler_1.handleFirebaseError)(testError, { test: true });
                    console.log('Error Handler Result:', handledError.type === error_handler_1.ErrorType.UNKNOWN ? '✅ Working' : '❌ Failed');
                    console.log('\n✅ All installation tests completed successfully!');
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _a.sent();
                    console.error('\n❌ Test suite failed:', error_3);
                    throw error_3;
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Run the tests
runTests()
    .then(function () {
    console.log('\n🎉 Test suite completed!');
})
    .catch(function (error) {
    console.error('\n💥 Test suite failed with error:', error);
});
