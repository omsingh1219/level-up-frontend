// =============================================================================
// GymOS TypeScript Domain Model Specifications
// =============================================================================

export type UserRole = 'ADMIN' | 'STAFF' | 'MEMBER';

export type StaffPermission =
  | 'members.read'
  | 'members.write'
  | 'members.delete'
  | 'renewals.read'
  | 'renewals.write'
  | 'complaints.read'
  | 'complaints.write'
  | 'products.read'
  | 'products.write'
  | 'analytics.read';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  gymId: string;
  permissions?: StaffPermission[];
  active: boolean;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gym {
  gymId: string;
  name: string;
  logoUrl?: string;
  ownerUid: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  timezone: string; // e.g. "Asia/Kolkata"
  openingHours: string; // e.g. "06:00 - 22:00"
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationInDays: number;
  price: number;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface CommunicationPreferences {
  whatsappOptIn: boolean;
  emailOptIn: boolean;
  notificationOptIn: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Member {
  id: string;
  gymId: string;
  userId?: string; // Links to auth user profile if registered
  fullName: string;
  phone: string;
  email: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string; // YYYY-MM-DD
  profileImageUrl?: string;
  emergencyContact?: EmergencyContact;
  joinedAt: string; // YYYY-MM-DD
  status: MemberStatus;
  communicationPreferences: CommunicationPreferences;
  currentMembershipId?: string;
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export interface Membership {
  id: string;
  gymId: string;
  memberId: string;
  planId: string;
  planName: string;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: MembershipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalRecord {
  id: string;
  gymId: string;
  membershipId: string;
  memberId: string;
  previousExpiryDate: string;
  newStartDate: string;
  newExpiryDate: string;
  planId: string;
  planName: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  processedByUid: string;
  createdAt: string;
}

export type ProductCategory =
  | 'SUPPLEMENTS'
  | 'APPAREL'
  | 'ACCESSORIES'
  | 'BEVERAGES'
  | 'EQUIPMENT'
  | 'OTHER';

export interface Product {
  id: string;
  gymId: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ComplaintCategory =
  | 'Equipment'
  | 'Cleanliness'
  | 'Maintenance'
  | 'Trainer'
  | 'Safety'
  | 'Other';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Complaint {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  photoUrls: string[];
  videoUrl?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  internalNotes?: string;
  resolvedAt?: string;
  resolvedByUid?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'MEMBERSHIP_EXPIRING'
  | 'MEMBERSHIP_EXPIRED'
  | 'MEMBERSHIP_RENEWED'
  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_UPDATED'
  | 'NEW_PRODUCT'
  | 'SYSTEM';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP';
export type NotificationStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface AppNotification {
  id: string;
  gymId: string;
  memberId?: string;
  recipientUserId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  status: NotificationStatus;
  idempotencyKey?: string;
  scheduledAt?: string;
  sentAt?: string;
  providerMessageId?: string;
  failureReason?: string;
  createdAt: string;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  status: 'UNCONFIGURED' | 'CONFIGURED' | 'VERIFIED' | 'ERROR';
  lastSync?: string;
  lastSuccessfulMessageAt?: string;
  lastFailedMessageAt?: string;
  lastErrorMessage?: string;
}

export interface EmailConfig {
  provider: 'SENDGRID' | 'RESEND' | 'SMTP' | 'NONE';
  fromEmail: string;
  replyToEmail: string;
  status: 'UNCONFIGURED' | 'CONFIGURED';
}

export interface AutomationSettings {
  reminderDaysBefore: number[]; // e.g. [7, 3, 1, 0]
  notifyOnExpired: boolean;
  sendWhatsAppReminders: boolean;
  sendEmailReminders: boolean;
  sendInAppReminders: boolean;
  whatsappConfig: WhatsAppConfig;
  emailConfig: EmailConfig;
  updatedAt: string;
}

export type AuditAction =
  | 'MEMBER_CREATED'
  | 'MEMBER_UPDATED'
  | 'MEMBER_DEACTIVATED'
  | 'MEMBERSHIP_CREATED'
  | 'MEMBERSHIP_RENEWED'
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'COMPLAINT_CREATED'
  | 'COMPLAINT_UPDATED'
  | 'STAFF_INVITED'
  | 'SETTINGS_UPDATED';

export interface AuditLog {
  id: string;
  gymId: string;
  actorUid: string;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  entityType: 'MEMBER' | 'MEMBERSHIP' | 'PLAN' | 'PRODUCT' | 'COMPLAINT' | 'STAFF' | 'SETTINGS';
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  expiringSoon: number;
  expired: number;
  newMembersThisMonth: number;
  renewalsThisMonth: number;
  monthlyRevenue: number;
  renewalRate: number;
}
