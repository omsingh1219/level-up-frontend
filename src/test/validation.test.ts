import { describe, it, expect } from 'vitest';
import {
  memberSchema,
  planSchema,
  productSchema,
  complaintSchema,
  signInSchema
} from '../lib/validation';

describe('Zod Validation Schemas', () => {
  it('validates correct member inputs and rejects invalid emails/phones', () => {
    const validMember = {
      fullName: 'Vikram Rathore',
      phone: '+91 98765 43210',
      email: 'vikram@example.com',
      gender: 'MALE',
      joinedAt: '2026-01-01',
      status: 'ACTIVE',
      communicationPreferences: {
        whatsappOptIn: true,
        emailOptIn: true,
        notificationOptIn: true,
      },
    };

    expect(memberSchema.safeParse(validMember).success).toBe(true);

    const invalidEmailMember = { ...validMember, email: 'not-an-email' };
    expect(memberSchema.safeParse(invalidEmailMember).success).toBe(false);

    const invalidPhoneMember = { ...validMember, phone: '123' };
    expect(memberSchema.safeParse(invalidPhoneMember).success).toBe(false);
  });

  it('validates membership plans and rejects negative prices or zero durations', () => {
    const validPlan = {
      name: '1 Month Standard',
      durationInDays: 30,
      price: 1500,
      description: 'Standard plan',
      active: true,
    };
    expect(planSchema.safeParse(validPlan).success).toBe(true);

    const negativePricePlan = { ...validPlan, price: -50 };
    expect(planSchema.safeParse(negativePricePlan).success).toBe(false);

    const zeroDurationPlan = { ...validPlan, durationInDays: 0 };
    expect(planSchema.safeParse(zeroDurationPlan).success).toBe(false);
  });

  it('validates product inventory models', () => {
    const validProduct = {
      name: 'Whey Protein 2kg',
      category: 'SUPPLEMENTS',
      price: 3499,
      stockQuantity: 15,
      description: 'High quality whey',
      active: true,
    };
    expect(productSchema.safeParse(validProduct).success).toBe(true);

    const invalidStockProduct = { ...validProduct, stockQuantity: -5 };
    expect(productSchema.safeParse(invalidStockProduct).success).toBe(false);
  });

  it('validates complaint reports and rejects short titles/descriptions', () => {
    const validComplaint = {
      category: 'Equipment',
      title: 'Treadmill belt loose',
      description: 'The running belt on treadmill 2 slips when sprinting above 10km/h.',
      priority: 'HIGH',
    };
    expect(complaintSchema.safeParse(validComplaint).success).toBe(true);

    const shortDesc = { ...validComplaint, description: 'Short' };
    expect(complaintSchema.safeParse(shortDesc).success).toBe(false);
  });
});
