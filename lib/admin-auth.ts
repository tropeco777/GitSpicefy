import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './supabase';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key-change-this-in-production';
const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminUser {
  id: string;
  email: string;
  is_super_admin: boolean;
  last_login: string;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  expiresAt: Date;
}

// Hash password for storage
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token for admin session
export function generateAdminToken(adminUser: AdminUser): string {
  const payload = {
    id: adminUser.id,
    email: adminUser.email,
    is_super_admin: adminUser.is_super_admin,
    type: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + ADMIN_SESSION_DURATION) / 1000),
  };

  return jwt.sign(payload, JWT_SECRET);
}

// Verify and decode admin token
export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== 'admin') {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      is_super_admin: decoded.is_super_admin,
      last_login: new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

// Authenticate admin user
export async function authenticateAdmin(email: string, password: string): Promise<AdminSession | null> {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return null;
    }

    // Get admin user from database
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !adminUser) {
      return null;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, adminUser.password_hash);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    if (supabase) {
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);
    }

    // Generate session
    const user: AdminUser = {
      id: adminUser.id,
      email: adminUser.email,
      is_super_admin: adminUser.is_super_admin,
      last_login: new Date().toISOString(),
    };

    const token = generateAdminToken(user);
    const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION);

    return {
      user,
      token,
      expiresAt,
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

// Middleware to check admin authentication
export function requireAdminAuth(handler: Function) {
  return async (req: any, res: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No admin token provided' });
      }

      const token = authHeader.substring(7);
      const adminUser = verifyAdminToken(token);

      if (!adminUser) {
        return res.status(401).json({ error: 'Invalid admin token' });
      }

      // Add admin user to request
      req.adminUser = adminUser;
      return handler(req, res);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Check if user is super admin
export function requireSuperAdmin(handler: Function) {
  return requireAdminAuth(async (req: any, res: any) => {
    if (!req.adminUser.is_super_admin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    return handler(req, res);
  });
}

// Sanitize input to prevent SQL injection
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>'"]/g, '') // Remove HTML/SQL injection chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 1000); // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Rate limiting for admin login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if more than 15 minutes have passed
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Allow max 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    return false;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

// Log admin activity
export async function logAdminActivity(
  adminId: string,
  action: string,
  details: any = {},
  ipAddress?: string
) {
  try {
    if (supabase) {
      await supabase.rpc('log_analytics_event', {
        p_user_id: adminId,
        p_event_type: `admin_${action}`,
        p_event_data: { ...details, admin: true },
        p_ip_address: ipAddress,
      });
    }
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
}
