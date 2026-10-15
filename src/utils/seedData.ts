import {
  doc,
  setDoc,
  collection,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Gym,
  UserProfile,
  MembershipPlan,
  Member,
  Membership,
  Product,
  Complaint,
  AppNotification,
  AuditLog
} from '@/types';
import { calculateExpiryDate, getMembershipStatusFromDates } from './dateUtils';
import { format, subDays, addDays, startOfToday, parseISO } from 'date-fns';

export async function seedDemoData(): Promise<{ gymId: string; adminEmail: string }> {
  console.log('[Seed] Starting GymOS demo data population...');
  const gymId = 'ironforge-demo-gym';
  const now = new Date().toISOString();
  const todayStr = format(startOfToday(), 'yyyy-MM-dd');

  // 1. Create Demo Gym
  const gym: Gym = {
    gymId,
    name: 'IronForge Fitness & Performance Center',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
    ownerUid: 'admin-ironforge-01',
    phone: '+91 98765 43210',
    email: 'admin@ironforge.fit',
    address: 'Plot 42, 100ft Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    timezone: 'Asia/Kolkata',
    openingHours: '05:30 - 22:30',
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'gyms', gymId), gym);

  // 2. Create Admin Profile
  const adminProfile: UserProfile = {
    uid: 'admin-ironforge-01',
    name: 'Vikram Rathore',
    email: 'admin@ironforge.fit',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    gymId,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'users', adminProfile.uid), adminProfile);

  // 3. Create 2 Staff Profiles
  const staff1: UserProfile = {
    uid: 'staff-ironforge-01',
    name: 'Pooja Hegde',
    email: 'pooja.hegde@ironforge.fit',
    phone: '+91 98222 11001',
    role: 'STAFF',
    gymId,
    permissions: ['members.read', 'members.write', 'renewals.read', 'renewals.write', 'complaints.read', 'complaints.write', 'products.read'],
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'users', staff1.uid), staff1);

  const staff2: UserProfile = {
    uid: 'staff-ironforge-02',
    name: 'Arjun Nair',
    email: 'arjun.nair@ironforge.fit',
    phone: '+91 98333 22002',
    role: 'STAFF',
    gymId,
    permissions: ['members.read', 'renewals.read', 'complaints.read', 'complaints.write', 'products.read', 'products.write'],
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'users', staff2.uid), staff2);

  // 4. Create 4 Membership Plans
  const plansData = [
    { id: 'plan-1-month', name: '1 Month Standard', durationInDays: 30, price: 2000, description: 'General access to gym equipment and locker facilities.' },
    { id: 'plan-3-months', name: '3 Months Transformation', durationInDays: 90, price: 5500, description: 'Gym access with personalized workout tracking and trainer consultation.' },
    { id: 'plan-6-months', name: '6 Months Muscle & Core', durationInDays: 180, price: 9800, description: 'Comprehensive fitness plan with diet guidance and sauna access.' },
    { id: 'plan-12-months', name: '12 Months Annual Elite', durationInDays: 365, price: 16500, description: 'All-inclusive annual pass with guest privileges and nutrition reviews.' },
  ];

  for (const p of plansData) {
    const plan: MembershipPlan = {
      ...p,
      gymId,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'gyms', gymId, 'membershipPlans', p.id), plan);
  }

  // 5. Create 20 Realistic Members
  const memberNames = [
    { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 99881 12341', gender: 'MALE' as const, planIdx: 1, offset: 25 },
    { name: 'Ananya Deshmukh', email: 'ananya.d@example.com', phone: '+91 99881 12342', gender: 'FEMALE' as const, planIdx: 3, offset: 120 },
    { name: 'Rohan Mehra', email: 'rohan.mehra@example.com', phone: '+91 99881 12343', gender: 'MALE' as const, planIdx: 0, offset: 7 }, // Expiring soon in 7d
    { name: 'Priya Iyer', email: 'priya.iyer@example.com', phone: '+91 99881 12344', gender: 'FEMALE' as const, planIdx: 0, offset: 3 }, // Expiring soon in 3d
    { name: 'Aditya Verma', email: 'aditya.v@example.com', phone: '+91 99881 12345', gender: 'MALE' as const, planIdx: 0, offset: 1 }, // Expiring tomorrow
    { name: 'Sneha Kapoor', email: 'sneha.kapoor@example.com', phone: '+91 99881 12346', gender: 'FEMALE' as const, planIdx: 0, offset: 0 }, // Expiring today!
    { name: 'Karan Singhania', email: 'karan.s@example.com', phone: '+91 99881 12347', gender: 'MALE' as const, planIdx: 1, offset: -2 }, // Expired 2 days ago
    { name: 'Deepika Rao', email: 'deepika.rao@example.com', phone: '+91 99881 12348', gender: 'FEMALE' as const, planIdx: 2, offset: -14 }, // Expired 14 days ago
    { name: 'Varun Dhawan', email: 'varun.d@example.com', phone: '+91 99881 12349', gender: 'MALE' as const, planIdx: 3, offset: 200 },
    { name: 'Neha Chawla', email: 'neha.c@example.com', phone: '+91 99881 12350', gender: 'FEMALE' as const, planIdx: 1, offset: 45 },
    { name: 'Amitabh Joshi', email: 'amitabh.j@example.com', phone: '+91 99881 12351', gender: 'MALE' as const, planIdx: 0, offset: 15 },
    { name: 'Divya Sen', email: 'divya.sen@example.com', phone: '+91 99881 12352', gender: 'FEMALE' as const, planIdx: 2, offset: 80 },
    { name: 'Gautam Gambhir', email: 'gautam.g@example.com', phone: '+91 99881 12353', gender: 'MALE' as const, planIdx: 3, offset: 300 },
    { name: 'Ritu Phogat', email: 'ritu.phogat@example.com', phone: '+91 99881 12354', gender: 'FEMALE' as const, planIdx: 1, offset: 50 },
    { name: 'Sanjay Dutt', email: 'sanjay.dutt@example.com', phone: '+91 99881 12355', gender: 'MALE' as const, planIdx: 2, offset: 95 },
    { name: 'Kavita Krishnan', email: 'kavita.k@example.com', phone: '+91 99881 12356', gender: 'FEMALE' as const, planIdx: 0, offset: 20 },
    { name: 'Sameer Kulkarni', email: 'sameer.k@example.com', phone: '+91 99881 12357', gender: 'MALE' as const, planIdx: 1, offset: 60 },
    { name: 'Meera Nambiar', email: 'meera.n@example.com', phone: '+91 99881 12358', gender: 'FEMALE' as const, planIdx: 0, offset: -5 }, // Expired 5d ago
    { name: 'Manoj Bajpayee', email: 'manoj.b@example.com', phone: '+91 99881 12359', gender: 'MALE' as const, planIdx: 3, offset: 180 },
    { name: 'Sunita Williams', email: 'sunita.w@example.com', phone: '+91 99881 12360', gender: 'FEMALE' as const, planIdx: 1, offset: 35 },
  ];

  // Also create a demo Member auth user account for Rahul Sharma
  const demoMemberProfile: UserProfile = {
    uid: 'member-demo-rahul',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 99881 12341',
    role: 'MEMBER',
    gymId,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'users', demoMemberProfile.uid), demoMemberProfile);

  for (let i = 0; i < memberNames.length; i++) {
    const item = memberNames[i];
    const memberId = `member-${i + 1}`;
    const plan = plansData[item.planIdx];

    // Calculate expiry and start date based on offset from today
    const expiryDate = format(addDays(startOfToday(), item.offset), 'yyyy-MM-dd');
    const startDate = format(subDays(parseISO(expiryDate), plan.durationInDays), 'yyyy-MM-dd');
    const memStatus = getMembershipStatusFromDates(expiryDate);

    const membershipId = `membership-${i + 1}`;
    const membership: Membership = {
      id: membershipId,
      gymId,
      memberId,
      planId: plan.id,
      planName: plan.name,
      startDate,
      expiryDate,
      amount: plan.price,
      paymentStatus: 'PAID',
      paymentMethod: i % 2 === 0 ? 'UPI' : 'CARD',
      status: memStatus,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'gyms', gymId, 'memberships', membershipId), membership);

    const member: Member = {
      id: memberId,
      gymId,
      userId: i === 0 ? 'member-demo-rahul' : undefined,
      fullName: item.name,
      phone: item.phone,
      email: item.email,
      gender: item.gender,
      dateOfBirth: '1995-05-15',
      joinedAt: startDate,
      status: memStatus === 'EXPIRED' && item.offset < -10 ? 'INACTIVE' : 'ACTIVE',
      communicationPreferences: {
        whatsappOptIn: true,
        emailOptIn: true,
        notificationOptIn: true,
      },
      currentMembershipId: membershipId,
      emergencyContact: {
        name: 'Guardian Contact',
        phone: '+91 98765 00000',
        relation: 'Family',
      },
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'gyms', gymId, 'members', memberId), member);
  }

  // 6. Create 8 Products
  const productsData: Omit<Product, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'IronForge Isolate Whey 2kg (Chocolate Fudge)',
      description: 'Ultra-pure 27g protein per scoop with added digestive enzymes and zero added sugar.',
      category: 'SUPPLEMENTS',
      price: 4999,
      stockQuantity: 24,
      imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
    {
      name: 'Pure Micronized Creatine Monohydrate 250g',
      description: '100% pure Creapure formula for explosive strength and muscle volumization.',
      category: 'SUPPLEMENTS',
      price: 1199,
      stockQuantity: 40,
      imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
    {
      name: 'Pre-Workout Ignition Fuel (Blue Raspberry)',
      description: '300mg caffeine, 3.2g beta-alanine, and 6g citrulline malate for razor-sharp pumps.',
      category: 'SUPPLEMENTS',
      price: 1899,
      stockQuantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
    {
      name: 'Heavy Duty Lifting Straps & Wrist Wraps Combo',
      description: 'Reinforced dual-stitching neoprene padded straps for maximal deadlifts and presses.',
      category: 'ACCESSORIES',
      price: 799,
      stockQuantity: 50,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
    {
      name: 'Stainless Steel Insulated Shaker Bottle 750ml',
      description: 'Double-walled vacuum insulated, keeps liquids icy cold for 24 hours. Leak-proof.',
      category: 'ACCESSORIES',
      price: 999,
      stockQuantity: 32,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
    {
      name: 'IronForge Performance Dri-Fit Athlete Tee',
      description: 'Breathable 4-way stretch fabric designed for high-intensity training sessions.',
      category: 'APPAREL',
      price: 899,
      stockQuantity: 45,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
    {
      name: 'Electrolyte Hydration Drink (Pack of 6)',
      description: 'Zero sugar isotonic formula with potassium, magnesium, and Himalayan pink salt.',
      category: 'BEVERAGES',
      price: 450,
      stockQuantity: 60,
      imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
    {
      name: 'Resistance Loop Bands (Set of 5 Levels)',
      description: 'Natural latex resistance bands from Extra Light to XX-Heavy with carry pouch.',
      category: 'EQUIPMENT',
      price: 649,
      stockQuantity: 28,
      imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=300&auto=format&fit=crop&q=80',
      active: true,
    },
  ];

  for (let i = 0; i < productsData.length; i++) {
    const prod = {
      ...productsData[i],
      id: `prod-${i + 1}`,
      gymId,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'gyms', gymId, 'products', prod.id), prod);
  }

  // 7. Create 5 Complaints
  const complaintsData = [
    {
      id: 'comp-1',
      memberId: 'member-1',
      memberName: 'Rahul Sharma',
      memberEmail: 'rahul.sharma@example.com',
      category: 'Equipment' as const,
      title: 'Cable crossover pulley cable frayed',
      description: 'The right side cable on the dual crossover station has visible wire fraying near the carabiner.',
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      photoUrls: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'],
      internalNotes: 'Technician contacted from LifeFitness service center. ETA Monday 11 AM.',
    },
    {
      id: 'comp-2',
      memberId: 'member-4',
      memberName: 'Priya Iyer',
      memberEmail: 'priya.iyer@example.com',
      category: 'Maintenance' as const,
      title: 'Water dispenser chiller not cooling',
      description: 'The water on floor 2 is warm. Dispenser motor seems to be turning off intermittently.',
      priority: 'MEDIUM' as const,
      status: 'OPEN' as const,
      photoUrls: [],
    },
    {
      id: 'comp-3',
      memberId: 'member-2',
      memberName: 'Ananya Deshmukh',
      memberEmail: 'ananya.d@example.com',
      category: 'Cleanliness' as const,
      title: 'Sanitizer wipes container empty near dumbbell rack',
      description: 'Both wipe dispensers in the free weights zone were out of wipes this morning.',
      priority: 'LOW' as const,
      status: 'RESOLVED' as const,
      photoUrls: [],
      internalNotes: 'Refilled by morning janitorial staff.',
      resolvedAt: now,
      resolvedByUid: 'staff-ironforge-01',
    },
    {
      id: 'comp-4',
      memberId: 'member-7',
      memberName: 'Karan Singhania',
      memberEmail: 'karan.s@example.com',
      category: 'Equipment' as const,
      title: '17.5kg rubber dumbbell loose collar',
      description: 'The weight plate shakes when benching. Potential safety hazard.',
      priority: 'CRITICAL' as const,
      status: 'OPEN' as const,
      photoUrls: [],
    },
    {
      id: 'comp-5',
      memberId: 'member-10',
      memberName: 'Neha Chawla',
      memberEmail: 'neha.c@example.com',
      category: 'Cleanliness' as const,
      title: 'Shower stall 3 drainage slow',
      description: 'Water pool forms during showers in stall 3 of the women locker room.',
      priority: 'MEDIUM' as const,
      status: 'IN_PROGRESS' as const,
      photoUrls: [],
      internalNotes: 'Plumber scheduled today at 2 PM.',
    },
  ];

  for (const c of complaintsData) {
    const comp: Complaint = {
      ...c,
      gymId,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'gyms', gymId, 'complaints', c.id), comp);
  }

  // 8. Create Notifications
  const notificationsData: Omit<AppNotification, 'id'>[] = [
    {
      gymId,
      type: 'MEMBERSHIP_EXPIRING',
      channel: 'IN_APP',
      title: 'Membership Expiring Soon',
      body: 'Your 1 Month Standard membership expires in 7 days.',
      isRead: false,
      status: 'SENT',
      createdAt: now,
    },
    {
      gymId,
      type: 'COMPLAINT_CREATED',
      channel: 'IN_APP',
      title: 'New Problem Reported: Cable crossover pulley',
      body: 'Rahul Sharma submitted an Equipment problem (HIGH priority).',
      isRead: false,
      status: 'SENT',
      createdAt: now,
    },
  ];

  for (let i = 0; i < notificationsData.length; i++) {
    await setDoc(doc(db, 'gyms', gymId, 'notifications', `notif-${i + 1}`), {
      id: `notif-${i + 1}`,
      ...notificationsData[i],
    });
  }

  // 9. Initial Audit Logs
  const auditLogsData: Omit<AuditLog, 'id'>[] = [
    {
      gymId,
      actorUid: 'admin-ironforge-01',
      actorName: 'Vikram Rathore',
      actorRole: 'ADMIN',
      action: 'SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: gymId,
      metadata: { action: 'Initial Gym Setup' },
      timestamp: now,
    },
    {
      gymId,
      actorUid: 'staff-ironforge-01',
      actorName: 'Pooja Hegde',
      actorRole: 'STAFF',
      action: 'MEMBER_CREATED',
      entityType: 'MEMBER',
      entityId: 'member-1',
      metadata: { memberName: 'Rahul Sharma' },
      timestamp: now,
    },
  ];

  for (let i = 0; i < auditLogsData.length; i++) {
    await setDoc(doc(db, 'gyms', gymId, 'auditLogs', `log-${i + 1}`), {
      id: `log-${i + 1}`,
      ...auditLogsData[i],
    });
  }

  console.log('[Seed] Demo data seeding completed successfully!');
  return { gymId, adminEmail: adminProfile.email };
}
