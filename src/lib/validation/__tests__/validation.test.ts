import { describe, it, expect } from '@jest/globals';
import {
  createTransactionSchema,
  createCustomerSchema,
  createLeadSchema,
  createRecurringPaymentSchema,
} from '../schemas';
import {
  validateInput,
  validatePartialInput,
  formatValidationErrors,
  ValidationError,
} from '../validator';

describe('Validation Schemas', () => {
  describe('createTransactionSchema', () => {
    it('should validate valid transaction data', () => {
      const validData = {
        type: 'expense',
        category: 'Office Supplies',
        description: 'Monthly office supplies purchase',
        amount: '150.50',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = validateInput(createTransactionSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('expense');
        expect(result.data.amount).toBe('150.50');
      }
    });

    it('should reject invalid transaction type', () => {
      const invalidData = {
        type: 'invalid_type',
        category: 'Office Supplies',
        description: 'Monthly office supplies purchase',
        amount: '150.50',
      };

      const result = validateInput(createTransactionSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error[0].field).toBe('type');
      }
    });

    it('should reject invalid amount format', () => {
      const invalidData = {
        type: 'expense',
        category: 'Office Supplies',
        description: 'Monthly office supplies purchase',
        amount: 'invalid-amount',
      };

      const result = validateInput(createTransactionSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error[0].field).toBe('amount');
      }
    });

    it('should reject invalid UUID format', () => {
      const invalidData = {
        type: 'expense',
        category: 'Office Supplies',
        description: 'Monthly office supplies purchase',
        amount: '150.50',
        customer_id: 'not-a-uuid',
      };

      const result = validateInput(createTransactionSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error[0].field).toBe('customer_id');
      }
    });

    it('should require mandatory fields', () => {
      const incompleteData = {
        type: 'expense',
        // missing category, description, amount
      };

      const result = validateInput(createTransactionSchema, incompleteData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.length).toBeGreaterThan(0);
        const fieldNames = result.error.map(e => e.field);
        expect(fieldNames).toContain('category');
        expect(fieldNames).toContain('description');
        expect(fieldNames).toContain('amount');
      }
    });
  });

  describe('createCustomerSchema', () => {
    it('should validate valid customer data', () => {
      const validData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        business: 'Acme Corp',
        status: 'active',
      };

      const result = validateInput(createCustomerSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'invalid-email',
        phone: '+1234567890',
        status: 'active',
      };

      const result = validateInput(createCustomerSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error[0].field).toBe('email');
      }
    });

    it('should reject invalid status', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'invalid_status',
      };

      const result = validateInput(createCustomerSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error[0].field).toBe('status');
      }
    });
  });

  describe('createLeadSchema', () => {
    it('should validate valid lead data', () => {
      const validData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        company: 'Tech Corp',
        source: 'manual',
        status: 'new',
        priority: 'medium',
      };

      const result = validateInput(createLeadSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid ZIP code format', () => {
      const invalidData = {
        first_name: 'Jane',
        last_name: 'Smith',
        source: 'manual',
        zip_code: 'invalid-zip',
      };

      const result = validateInput(createLeadSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const zipError = result.error.find(e => e.field === 'zip_code');
        expect(zipError).toBeDefined();
      }
    });

    it('should reject invalid confidence score', () => {
      const invalidData = {
        first_name: 'Jane',
        last_name: 'Smith',
        source: 'ai_agent',
        ai_confidence_score: 150, // > 100
      };

      const result = validateInput(createLeadSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const scoreError = result.error.find(e => e.field === 'ai_confidence_score');
        expect(scoreError).toBeDefined();
      }
    });
  });

  describe('createRecurringPaymentSchema', () => {
    it('should validate valid recurring payment data', () => {
      const validData = {
        type: 'expense',
        category: 'Subscription',
        description: 'Monthly software subscription',
        amount: '99.99',
        frequency: 'monthly',
        start_date: '2025-01-01T00:00:00Z',
        day_of_month: 15,
      };

      const result = validateInput(createRecurringPaymentSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid frequency', () => {
      const invalidData = {
        type: 'expense',
        category: 'Subscription',
        description: 'Monthly software subscription',
        amount: '99.99',
        frequency: 'invalid_frequency',
        start_date: '2025-01-01T00:00:00Z',
      };

      const result = validateInput(createRecurringPaymentSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error[0].field).toBe('frequency');
      }
    });

    it('should reject invalid day_of_month', () => {
      const invalidData = {
        type: 'expense',
        category: 'Subscription',
        description: 'Monthly software subscription',
        amount: '99.99',
        frequency: 'monthly',
        start_date: '2025-01-01T00:00:00Z',
        day_of_month: 32, // > 31
      };

      const result = validateInput(createRecurringPaymentSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const dayError = result.error.find(e => e.field === 'day_of_month');
        expect(dayError).toBeDefined();
      }
    });

    it('should reject invalid day_of_week', () => {
      const invalidData = {
        type: 'expense',
        category: 'Subscription',
        description: 'Weekly service',
        amount: '29.99',
        frequency: 'weekly',
        start_date: '2025-01-01T00:00:00Z',
        day_of_week: 7, // > 6
      };

      const result = validateInput(createRecurringPaymentSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const dayError = result.error.find(e => e.field === 'day_of_week');
        expect(dayError).toBeDefined();
      }
    });
  });
});

describe('Validation Helpers', () => {
  describe('validatePartialInput', () => {
    it('should validate partial updates', () => {
      const partialData = {
        category: 'Updated Category',
        // other fields omitted
      };

      const result = validatePartialInput(createTransactionSchema, partialData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('Updated Category');
      }
    });

    it('should reject invalid partial data', () => {
      const partialData = {
        type: 'invalid_type',
      };

      const result = validatePartialInput(createTransactionSchema, partialData);
      expect(result.success).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation errors correctly', () => {
      const errors: ValidationError[] = [
        { field: 'email', message: 'Invalid email format', code: 'invalid_string' },
        { field: 'amount', message: 'Must be positive', code: 'too_small' },
      ];

      const formatted = formatValidationErrors(errors);
      expect(formatted).toBe('email: Invalid email format; amount: Must be positive');
    });

    it('should handle single error', () => {
      const errors: ValidationError[] = [
        { field: 'email', message: 'Invalid email format', code: 'invalid_string' },
      ];

      const formatted = formatValidationErrors(errors);
      expect(formatted).toBe('Invalid email format');
    });

    it('should handle empty errors', () => {
      const errors: ValidationError[] = [];
      const formatted = formatValidationErrors(errors);
      expect(formatted).toBe('Validation failed');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle null and undefined values', () => {
    const result = validateInput(createTransactionSchema, null);
    expect(result.success).toBe(false);
  });

  it('should handle empty objects', () => {
    const result = validateInput(createTransactionSchema, {});
    expect(result.success).toBe(false);
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(2000); // Very long string
    const data = {
      type: 'expense',
      category: longString,
      description: 'Test',
      amount: '100.00',
    };

    const result = validateInput(createTransactionSchema, data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const categoryError = result.error.find(e => e.field === 'category');
      expect(categoryError).toBeDefined();
    }
  });

  it('should handle SQL injection attempts', () => {
    const maliciousData = {
      type: 'expense',
      category: "'; DROP TABLE transactions; --",
      description: 'Normal description',
      amount: '100.00',
    };

    const result = validateInput(createTransactionSchema, maliciousData);
    // Should still validate as it's just a string, but will be sanitized by database
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("'; DROP TABLE transactions; --");
    }
  });

  it('should handle XSS attempts', () => {
    const xssData = {
      type: 'expense',
      category: '<script>alert("xss")</script>',
      description: 'Normal description',
      amount: '100.00',
    };

    const result = validateInput(createTransactionSchema, xssData);
    // Should validate but content should be escaped in UI
    expect(result.success).toBe(true);
  });

  it('should handle unicode characters', () => {
    const unicodeData = {
      type: 'expense',
      category: '测试类别', // Chinese characters
      description: 'Test with émojis 🎉',
      amount: '100.00',
    };

    const result = validateInput(createTransactionSchema, unicodeData);
    expect(result.success).toBe(true);
  });
});