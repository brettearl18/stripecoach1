import { DocumentData } from 'firebase/firestore';

// Data validation schemas
export const schemas = {
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

// Type definitions
type ValidationError = {
  field: string;
  message: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// Validation functions
export const validateData = (data: DocumentData, schema: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!data[field]) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }
  }

  // Validate properties
  for (const [field, value] of Object.entries(data)) {
    const propertySchema = schema.properties[field];
    if (!propertySchema) continue;

    // Type validation
    if (propertySchema.type && typeof value !== propertySchema.type) {
      errors.push({
        field,
        message: `${field} must be of type ${propertySchema.type}`
      });
      continue;
    }

    // String validations
    if (propertySchema.type === 'string') {
      if (propertySchema.minLength && value.length < propertySchema.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${propertySchema.minLength} characters`
        });
      }

      if (propertySchema.format === 'email' && !validateEmail(value as string)) {
        errors.push({
          field,
          message: `${field} must be a valid email address`
        });
      }

      if (propertySchema.pattern && !new RegExp(propertySchema.pattern).test(value as string)) {
        errors.push({
          field,
          message: `${field} format is invalid`
        });
      }
    }

    // Enum validation
    if (propertySchema.enum && !propertySchema.enum.includes(value)) {
      errors.push({
        field,
        message: `${field} must be one of: ${propertySchema.enum.join(', ')}`
      });
    }

    // Array validation
    if (propertySchema.type === 'array' && Array.isArray(value)) {
      value.forEach((item, index) => {
        if (propertySchema.items.type && typeof item !== propertySchema.items.type) {
          errors.push({
            field: `${field}[${index}]`,
            message: `must be of type ${propertySchema.items.type}`
          });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 