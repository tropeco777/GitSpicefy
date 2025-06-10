import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    console.log('Admin token verification - Token exists:', !!token);

    if (!token) {
      console.log('No admin token found');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify JWT token
    const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key-change-this-in-production-GitSpicefy2024';
    console.log('Using JWT secret:', JWT_SECRET.substring(0, 10) + '...');

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Token decoded successfully:', { id: decoded.id, email: decoded.email, type: decoded.type });

    if (decoded.type !== 'admin') {
      console.log('Invalid token type:', decoded.type);
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        is_super_admin: decoded.is_super_admin,
      }
    });
  } catch (error) {
    console.error('Admin token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
