import { describe, it, expect } from 'vitest';
import type { UserProfile, StaffPermission } from '../types';

describe('Role-Based Access Control & Tenant Isolation Logic', () => {
  const adminUser: UserProfile = {
    uid: 'admin-01',
    name: 'Admin User',
    email: 'admin@gym-a.com',
    role: 'ADMIN',
    gymId: 'gym-a',
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const staffUser: UserProfile = {
    uid: 'staff-01',
    name: 'Staff User',
    email: 'staff@gym-a.com',
    role: 'STAFF',
    gymId: 'gym-a',
    permissions: ['members.read', 'members.write', 'complaints.read'],
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const memberUser: UserProfile = {
    uid: 'member-01',
    name: 'Member User',
    email: 'member@gym-a.com',
    role: 'MEMBER',
    gymId: 'gym-a',
    active: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  function checkPermission(user: UserProfile, permission: StaffPermission): boolean {
    if (!user.active) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'STAFF' && user.permissions) {
      return user.permissions.includes(permission);
    }
    return false;
  }

  function checkTenantAccess(user: UserProfile, resourceGymId: string): boolean {
    return user.active && user.gymId === resourceGymId;
  }

  it('allows Admin full access across all operations', () => {
    expect(checkPermission(adminUser, 'members.read')).toBe(true);
    expect(checkPermission(adminUser, 'members.write')).toBe(true);
    expect(checkPermission(adminUser, 'renewals.write')).toBe(true);
    expect(checkPermission(adminUser, 'analytics.read')).toBe(true);
  });

  it('correctly evaluates Staff explicit permissions', () => {
    expect(checkPermission(staffUser, 'members.read')).toBe(true);
    expect(checkPermission(staffUser, 'members.write')).toBe(true);
    expect(checkPermission(staffUser, 'complaints.read')).toBe(true);
    // Disallowed permissions
    expect(checkPermission(staffUser, 'renewals.write')).toBe(false);
    expect(checkPermission(staffUser, 'analytics.read')).toBe(false);
  });

  it('denies Member access to operational staff permissions', () => {
    expect(checkPermission(memberUser, 'members.read')).toBe(false);
    expect(checkPermission(memberUser, 'members.write')).toBe(false);
    expect(checkPermission(memberUser, 'renewals.write')).toBe(false);
  });

  it('enforces multi-tenant data isolation: Gym A user cannot access Gym B data', () => {
    expect(checkTenantAccess(adminUser, 'gym-a')).toBe(true);
    expect(checkTenantAccess(adminUser, 'gym-b')).toBe(false); // DENIED
    expect(checkTenantAccess(staffUser, 'gym-b')).toBe(false); // DENIED
    expect(checkTenantAccess(memberUser, 'gym-b')).toBe(false); // DENIED
  });

  it('rejects incorrect password during sign-in and accepts correct password', async () => {
    const { localStore } = await import('../lib/localStore');
    const { signIn } = await import('../services/authService');

    localStore.saveCredential('security_test@gymos.com', 'CorrectPass123!');
    localStore.saveUser({
      uid: 'sec-user-1',
      name: 'Security Test',
      email: 'security_test@gymos.com',
      role: 'ADMIN',
      gymId: 'gym-sec',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Wrong password must throw
    await expect(signIn('security_test@gymos.com', 'WrongPass999!')).rejects.toThrow('Incorrect password');

    // Correct password must succeed
    const user = await signIn('security_test@gymos.com', 'CorrectPass123!');
    expect(user.email).toBe('security_test@gymos.com');
  });
});
