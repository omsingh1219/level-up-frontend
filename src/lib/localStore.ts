import type {
  Gym,
  UserProfile,
  MembershipPlan,
  Member,
  Membership,
  RenewalRecord,
  Product,
  Complaint,
  AppNotification,
  AuditLog
} from '@/types';

// In-memory + LocalStorage Fallback Store
class LocalGymStore {
  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(`gymos_${key}`);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`gymos_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  // Users
  getUsers(): UserProfile[] {
    return this.getStorage<UserProfile[]>('users', []);
  }

  saveUser(user: UserProfile): void {
    const users = this.getUsers().filter(u => u.uid !== user.uid && u.email !== user.email);
    users.push(user);
    this.setStorage('users', users);
  }

  getUser(uidOrEmail: string): UserProfile | null {
    const users = this.getUsers();
    return users.find(u => u.uid === uidOrEmail || u.email.toLowerCase() === uidOrEmail.toLowerCase()) || null;
  }

  // User Credentials for Local Auth
  getCredentials(): Record<string, string> {
    return this.getStorage<Record<string, string>>('credentials', {
      'admin@ironforge.fit': 'Password123!',
      'admin@ironforge.com': 'Password123!',
      'staff@ironforge.com': 'Password123!',
      'pooja.hegde@ironforge.fit': 'Password123!',
      'member@ironforge.com': 'Password123!',
      'marcus@athlete.com': 'Password123!',
      'rahul.sharma@example.com': 'Password123!',
      'reacher1219101@gmail.com': 'Password123!',
    });
  }

  saveCredential(email: string, pass: string): void {
    const creds = this.getCredentials();
    creds[email.toLowerCase().trim()] = pass;
    this.setStorage('credentials', creds);
  }

  verifyPassword(email: string, pass: string): boolean {
    const creds = this.getCredentials();
    const stored = creds[email.toLowerCase().trim()];
    if (!stored) {
      // Default fallback passwords for demo or unassigned users
      return pass === 'Password123!' || pass === 'password123';
    }
    return stored === pass;
  }

  // Gyms
  getGyms(): Gym[] {
    return this.getStorage<Gym[]>('gyms', []);
  }

  saveGym(gym: Gym): void {
    const gyms = this.getGyms().filter(g => g.gymId !== gym.gymId);
    gyms.push(gym);
    this.setStorage('gyms', gyms);
  }

  getGym(gymId: string): Gym | null {
    const gyms = this.getGyms();
    return gyms.find(g => g.gymId === gymId) || null;
  }

  // Members
  getMembers(gymId: string): Member[] {
    const all = this.getStorage<Member[]>('members', []);
    return all.filter(m => m.gymId === gymId);
  }

  saveMember(member: Member): void {
    const all = this.getStorage<Member[]>('members', []).filter(m => m.id !== member.id);
    all.push(member);
    this.setStorage('members', all);
  }

  deleteMember(memberId: string): void {
    const all = this.getStorage<Member[]>('members', []).filter(m => m.id !== memberId);
    this.setStorage('members', all);
  }

  // Plans
  getPlans(gymId: string): MembershipPlan[] {
    const all = this.getStorage<MembershipPlan[]>('plans', []);
    return all.filter(p => p.gymId === gymId);
  }

  savePlan(plan: MembershipPlan): void {
    const all = this.getStorage<MembershipPlan[]>('plans', []).filter(p => p.id !== plan.id);
    all.push(plan);
    this.setStorage('plans', all);
  }

  // Memberships
  getMemberships(gymId: string): Membership[] {
    const all = this.getStorage<Membership[]>('memberships', []);
    return all.filter(m => m.gymId === gymId);
  }

  saveMembership(ms: Membership): void {
    const all = this.getStorage<Membership[]>('memberships', []).filter(m => m.id !== ms.id);
    all.push(ms);
    this.setStorage('memberships', all);
  }

  // Renewals
  getRenewals(gymId: string): RenewalRecord[] {
    const all = this.getStorage<RenewalRecord[]>('renewals', []);
    return all.filter(r => r.gymId === gymId);
  }

  saveRenewal(r: RenewalRecord): void {
    const all = this.getStorage<RenewalRecord[]>('renewals', []);
    all.unshift(r);
    this.setStorage('renewals', all);
  }

  // Products
  getProducts(gymId: string): Product[] {
    const all = this.getStorage<Product[]>('products', []);
    return all.filter(p => p.gymId === gymId);
  }

  saveProduct(prod: Product): void {
    const all = this.getStorage<Product[]>('products', []).filter(p => p.id !== prod.id);
    all.push(prod);
    this.setStorage('products', all);
  }

  // Complaints
  getComplaints(gymId: string): Complaint[] {
    const all = this.getStorage<Complaint[]>('complaints', []);
    return all.filter(c => c.gymId === gymId);
  }

  saveComplaint(comp: Complaint): void {
    const all = this.getStorage<Complaint[]>('complaints', []).filter(c => c.id !== comp.id);
    all.unshift(comp);
    this.setStorage('complaints', all);
  }

  // Notifications
  getNotifications(gymId: string): AppNotification[] {
    const all = this.getStorage<AppNotification[]>('notifications', []);
    return all.filter(n => n.gymId === gymId);
  }

  saveNotification(notif: AppNotification): void {
    const all = this.getStorage<AppNotification[]>('notifications', []);
    all.unshift(notif);
    this.setStorage('notifications', all);
  }

  // Audit Logs
  getAuditLogs(gymId: string): AuditLog[] {
    const all = this.getStorage<AuditLog[]>('audit_logs', []);
    return all.filter(l => l.gymId === gymId);
  }

  saveAuditLog(log: AuditLog): void {
    const all = this.getStorage<AuditLog[]>('audit_logs', []);
    all.unshift(log);
    this.setStorage('audit_logs', all);
  }
}

export const localStore = new LocalGymStore();
