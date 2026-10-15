import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']).default('ADMIN'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const onboardingGymSchema = z.object({
  name: z.string().min(2, 'Gym name is required (min 2 characters)'),
  phone: z.string().min(7, 'Valid contact phone number is required'),
  email: z.string().email('Valid business email is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  country: z.string().min(2, 'Country is required').default('India'),
  timezone: z.string().default('Asia/Kolkata'),
  openingHours: z.string().default('06:00 - 22:00'),
  initialPlans: z.boolean().default(true),
});

export const memberSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (min 2 characters)'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  email: z.string().email('Valid email address is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  dateOfBirth: z.string().optional(),
  joinedAt: z.string().default(() => new Date().toISOString().split('T')[0]),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  emergencyContact: z.object({
    name: z.string().default(''),
    phone: z.string().default(''),
    relation: z.string().default(''),
  }).optional(),
  communicationPreferences: z.object({
    whatsappOptIn: z.boolean().default(true),
    emailOptIn: z.boolean().default(true),
    notificationOptIn: z.boolean().default(true),
  }).default({
    whatsappOptIn: true,
    emailOptIn: true,
    notificationOptIn: true,
  }),
});

export const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  durationInDays: z.number().int().positive('Duration must be at least 1 day'),
  price: z.number().nonnegative('Price must be greater than or equal to 0'),
  description: z.string().default(''),
  active: z.boolean().default(true),
});

export const assignMembershipSchema = z.object({
  memberId: z.string().min(1, 'Member selection is required'),
  planId: z.string().min(1, 'Plan selection is required'),
  startDate: z.string().min(10, 'Valid start date is required (YYYY-MM-DD)'),
  amount: z.number().nonnegative('Amount must be non-negative'),
  paymentStatus: z.enum(['PAID', 'PENDING', 'FAILED', 'REFUNDED']).default('PAID'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('UPI'),
});

export const renewalSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  newStartDate: z.string().min(10, 'Start date is required'),
  amount: z.number().nonnegative('Amount must be non-negative'),
  paymentStatus: z.enum(['PAID', 'PENDING', 'FAILED', 'REFUNDED']).default('PAID'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('UPI'),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().default(''),
  category: z.enum(['SUPPLEMENTS', 'APPAREL', 'ACCESSORIES', 'BEVERAGES', 'EQUIPMENT', 'OTHER']),
  price: z.number().positive('Price must be greater than 0'),
  stockQuantity: z.number().int().nonnegative('Stock quantity must be 0 or more'),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
});

export const complaintSchema = z.object({
  category: z.enum(['Equipment', 'Cleanliness', 'Maintenance', 'Trainer', 'Safety', 'Other']),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});
