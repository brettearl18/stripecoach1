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
exports.checkSessionValidity = exports.MAX_SESSION_DURATION = exports.checkUserRole = exports.Roles = exports.incrementAuthAttempts = exports.checkAuthAttempts = exports.validatePassword = exports.passwordRules = void 0;
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
var config_1 = require("./config");
// Password strength validation
exports.passwordRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    maxLength: 128
};
var validatePassword = function (password) {
    var errors = [];
    if (password.length < exports.passwordRules.minLength) {
        errors.push("Password must be at least ".concat(exports.passwordRules.minLength, " characters long"));
    }
    if (password.length > exports.passwordRules.maxLength) {
        errors.push("Password must be less than ".concat(exports.passwordRules.maxLength, " characters"));
    }
    if (exports.passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (exports.passwordRules.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (exports.passwordRules.requireNumber && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (exports.passwordRules.requireSpecialChar && !/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};
exports.validatePassword = validatePassword;
// Rate limiting for authentication attempts
var MAX_ATTEMPTS = 5;
var LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
var attemptTracker = new Map();
var checkAuthAttempts = function (identifier) {
    var now = Date.now();
    var attempts = attemptTracker.get(identifier);
    if (!attempts) {
        attemptTracker.set(identifier, { count: 0, lastAttempt: now });
        return { allowed: true };
    }
    if (attempts.count >= MAX_ATTEMPTS) {
        var timeSinceLastAttempt = now - attempts.lastAttempt;
        if (timeSinceLastAttempt < LOCKOUT_DURATION) {
            return {
                allowed: false,
                timeLeft: Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60)
            };
        }
        attemptTracker.set(identifier, { count: 0, lastAttempt: now });
    }
    return { allowed: true };
};
exports.checkAuthAttempts = checkAuthAttempts;
var incrementAuthAttempts = function (identifier) {
    var attempts = attemptTracker.get(identifier) || { count: 0, lastAttempt: Date.now() };
    attemptTracker.set(identifier, {
        count: attempts.count + 1,
        lastAttempt: Date.now()
    });
};
exports.incrementAuthAttempts = incrementAuthAttempts;
// Role-based access control
exports.Roles = {
    ADMIN: 'admin',
    COACH: 'coach',
    CLIENT: 'client'
};
var checkUserRole = function (uid) { return __awaiter(void 0, void 0, void 0, function () {
    var userDoc, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, firestore_1.getDoc)((0, firestore_1.doc)(config_1.db, 'users', uid))];
            case 1:
                userDoc = _a.sent();
                return [2 /*return*/, userDoc.exists() ? userDoc.data().role : null];
            case 2:
                error_1 = _a.sent();
                console.error('Error checking user role:', error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.checkUserRole = checkUserRole;
// Session management
exports.MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
var checkSessionValidity = function () { return __awaiter(void 0, void 0, void 0, function () {
    var auth, user, token, authTime, now, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                auth = (0, auth_1.getAuth)();
                user = auth.currentUser;
                if (!user)
                    return [2 /*return*/, false];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, user.getIdTokenResult()];
            case 2:
                token = _a.sent();
                authTime = new Date(token.authTime).getTime();
                now = Date.now();
                if (!(now - authTime > exports.MAX_SESSION_DURATION)) return [3 /*break*/, 4];
                return [4 /*yield*/, auth.signOut()];
            case 3:
                _a.sent();
                return [2 /*return*/, false];
            case 4: return [2 /*return*/, true];
            case 5:
                error_2 = _a.sent();
                console.error('Error checking session validity:', error_2);
                return [2 /*return*/, false];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.checkSessionValidity = checkSessionValidity;
