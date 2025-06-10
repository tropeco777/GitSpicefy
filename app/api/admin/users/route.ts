import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        users: []
      }, { status: 503 });
    }

    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key-change-this-in-production-GitSpicefy2024';
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'admin') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch users from subscriptions table with auth.users data
    const { data: users, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan,
        generations_used,
        created_at,
        updated_at,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const transformedUsers = users?.map((subscription: any) => {
      const user = Array.isArray(subscription.user) ? subscription.user[0] : subscription.user;
      return {
        id: subscription.id,
        github_id: user?.raw_user_meta_data?.provider_id || 'unknown',
        email: user?.email || 'unknown',
        name: user?.raw_user_meta_data?.full_name || user?.raw_user_meta_data?.user_name || 'Unknown User',
        avatar_url: user?.raw_user_meta_data?.avatar_url || '/default-avatar.png',
        plan: subscription.plan,
        usage_count: subscription.generations_used || 0,
        created_at: subscription.created_at,
        last_login: subscription.updated_at,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total: transformedUsers.length,
    });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service temporarily unavailable'
      }, { status: 503 });
    }

    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key-change-this-in-production-GitSpicefy2024';
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'admin') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, updates } = body;

    // Validate input
    if (!userId || !updates) {
      return NextResponse.json({ error: 'User ID and updates are required' }, { status: 400 });
    }

    // Sanitize updates - only allow specific fields and map to correct column names
    const allowedFields = ['plan', 'usage_count'];
    const sanitizedUpdates: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        if (key === 'plan') {
          const validPlans = ['free', 'starter', 'monthly', 'lifetime'];
          if (validPlans.includes(value as string)) {
            sanitizedUpdates[key] = value;
          }
        } else if (key === 'usage_count') {
          const numValue = parseInt(value as string);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 10000) {
            // Map to correct column name in database
            sanitizedUpdates['generations_used'] = numValue;
          }
        }
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Update user subscription
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
