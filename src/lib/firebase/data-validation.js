"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = exports.schemas = void 0;
// Data validation schemas
exports.schemas = {
    user: {
        required: ['email', 'role'],
        properties: {
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'coach', 'client'] },
            name: { type: 'string', minLength: 2 },
            phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
            organizationId: { type: 'string' }
        }
    },
    organization: {
        required: ['name', 'ownerId', 'plan'],
        properties: {
            name: { type: 'string', minLength: 2 },
            ownerId: { type: 'string' },
            plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
            settings: { type: 'object' }
        }
    },
    checkInForm: {
        required: ['title', 'questions'],
        properties: {
            title: { type: 'string', minLength: 2 },
            description: { type: 'string' },
            questions: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['type', 'text'],
                    properties: {
                        type: { type: 'string', enum: ['text', 'number', 'select', 'multiselect'] },
                        text: { type: 'string' },
                        required: { type: 'boolean' },
                        options: { type: 'array', items: { type: 'string' } }
                    }
                }
            }
        }
    }
};
// Validation functions
var validateData = function (data, schema) {
    var errors = [];
    // Check required fields
    if (schema.required) {
        for (var _i = 0, _a = schema.required; _i < _a.length; _i++) {
            var field = _a[_i];
            if (!data[field]) {
                errors.push({
                    field: field,
                    message: "".concat(field, " is required")
                });
            }
        }
    }
    var _loop_1 = function (field, value) {
        var propertySchema = schema.properties[field];
        if (!propertySchema)
            return "continue";
        // Type validation
        if (propertySchema.type && typeof value !== propertySchema.type) {
            errors.push({
                field: field,
                message: "".concat(field, " must be of type ").concat(propertySchema.type)
            });
            return "continue";
        }
        // String validations
        if (propertySchema.type === 'string') {
            if (propertySchema.minLength && value.length < propertySchema.minLength) {
                errors.push({
                    field: field,
                    message: "".concat(field, " must be at least ").concat(propertySchema.minLength, " characters")
                });
            }
            if (propertySchema.format === 'email' && !validateEmail(value)) {
                errors.push({
                    field: field,
                    message: "".concat(field, " must be a valid email address")
                });
            }
            if (propertySchema.pattern && !new RegExp(propertySchema.pattern).test(value)) {
                errors.push({
                    field: field,
                    message: "".concat(field, " format is invalid")
                });
            }
        }
        // Enum validation
        if (propertySchema.enum && !propertySchema.enum.includes(value)) {
            errors.push({
                field: field,
                message: "".concat(field, " must be one of: ").concat(propertySchema.enum.join(', '))
            });
        }
        // Array validation
        if (propertySchema.type === 'array' && Array.isArray(value)) {
            value.forEach(function (item, index) {
                if (propertySchema.items.type && typeof item !== propertySchema.items.type) {
                    errors.push({
                        field: "".concat(field, "[").concat(index, "]"),
                        message: "must be of type ".concat(propertySchema.items.type)
                    });
                }
            });
        }
    };
    // Validate properties
    for (var _b = 0, _c = Object.entries(data); _b < _c.length; _b++) {
        var _d = _c[_b], field = _d[0], value = _d[1];
        _loop_1(field, value);
    }
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};
exports.validateData = validateData;
// Helper functions
var validateEmail = function (email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
