import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        generations: []
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

    // Fetch generations from generation_history table with user data
    const { data: generations, error } = await supabaseAdmin
      .from('generation_history')
      .select(`
        id,
        user_id,
        repository_url,
        repository_name,
        generation_type,
        status,
        generation_time_ms,
        created_at,
        generated_content,
        user:user_id (
          email,
          raw_user_meta_data
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 generations

    if (error) {
      console.error('Error fetching generations:', error);
      return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 });
    }

    // Transform the data to match expected format
    const transformedGenerations = generations?.map((gen: any) => {
      const user = Array.isArray(gen.user) ? gen.user[0] : gen.user;
      return {
        id: gen.id,
        user_id: gen.user_id,
        user_email: user?.email || 'unknown',
        user_name: user?.raw_user_meta_data?.full_name || user?.raw_user_meta_data?.user_name || 'Unknown User',
        repository_url: gen.repository_url,
        generation_type: gen.generation_type,
        status: gen.status,
        generation_time_ms: gen.generation_time_ms,
        created_at: gen.created_at,
        readme_content: gen.generated_content,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      generations: transformedGenerations,
      total: transformedGenerations.length,
    });
  } catch (error) {
    console.error('Admin generations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
