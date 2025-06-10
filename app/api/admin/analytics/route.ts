import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        analytics: {
          users: { total: 0, new: 0, byPlan: {} },
          generations: { total: 0, recent: 0, byType: {}, byStatus: {} },
          revenue: { total: 0, monthly: 0, byPlan: {} }
        }
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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const metric = searchParams.get('metric') || 'overview';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    let analytics: any = {};

    // User statistics
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, created_at, generations_used');

    const { data: newUsers, error: newUsersError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, created_at')
      .gte('created_at', startDate.toISOString());

    if (allUsers) {
      const planCounts = allUsers.reduce((acc: any, user: any) => {
        acc[user.plan] = (acc[user.plan] || 0) + 1;
        return acc;
      }, {});

      analytics.users = {
        total: allUsers.length,
        new: newUsers?.length || 0,
        byPlan: planCounts,
      };
    }

    // Generation statistics
    const { data: allGenerations, error: generationsError } = await supabaseAdmin
      .from('generation_history')
      .select('generation_type, status, created_at, generation_time_ms');

    const { data: recentGenerations, error: recentGenerationsError } = await supabaseAdmin
      .from('generation_history')
      .select('generation_type, status, created_at, generation_time_ms')
      .gte('created_at', startDate.toISOString());

    if (allGenerations) {
      const typeCounts = allGenerations.reduce((acc: any, gen: any) => {
        acc[gen.generation_type || 'basic'] = (acc[gen.generation_type || 'basic'] || 0) + 1;
        return acc;
      }, {});

      const statusCounts = allGenerations.reduce((acc: any, gen: any) => {
        acc[gen.status || 'completed'] = (acc[gen.status || 'completed'] || 0) + 1;
        return acc;
      }, {});

      const avgTime = allGenerations.length > 0
        ? Math.round(allGenerations.reduce((sum, g) => sum + (g.generation_time_ms || 2000), 0) / allGenerations.length)
        : 0;

      analytics.generations = {
        total: allGenerations.length,
        recent: recentGenerations?.length || 0,
        byType: typeCounts,
        byStatus: statusCounts,
        averageTime: avgTime,
      };
    }

    // Revenue calculation based on real plan data
    if (allUsers) {
      const revenueByPlan = {
        starter: 3.99,
        monthly: 14.99,
        lifetime: 54.99,
      };

      const revenue = allUsers.reduce((acc: any, user: any) => {
        const amount = revenueByPlan[user.plan as keyof typeof revenueByPlan] || 0;
        acc.total += amount;
        acc.byPlan[user.plan] = (acc.byPlan[user.plan] || 0) + amount;
        return acc;
      }, { total: 0, byPlan: {} });

      analytics.revenue = revenue;
    }

    // Timeline data for charts (generate from real data)
    analytics.timeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayUsers = allUsers?.filter(u =>
        new Date(u.created_at).toDateString() === date.toDateString()
      ).length || 0;

      const dayGenerations = allGenerations?.filter(g =>
        new Date(g.created_at).toDateString() === date.toDateString()
      ).length || 0;

      analytics.timeline.push({
        date: dateStr,
        users: dayUsers,
        generations: dayGenerations,
        revenue: dayUsers * 15 + dayGenerations * 2, // Simulated revenue
      });
    }

    // If no real data exists, provide fallback with real data structure
    if (!analytics.users && !analytics.generations && !analytics.revenue) {
      // Try to get some basic real data
      const { data: allUsers } = await supabaseAdmin
        .from('subscriptions')
        .select('plan, created_at');

      const { data: allGenerations } = await supabaseAdmin
        .from('generation_history')
        .select('generation_type, status, generation_time_ms, created_at');

      if (allUsers && allUsers.length > 0) {
        const planCounts = allUsers.reduce((acc: any, user: any) => {
          acc[user.plan] = (acc[user.plan] || 0) + 1;
          return acc;
        }, {});

        analytics.users = {
          total: allUsers.length,
          new: allUsers.filter(u => new Date(u.created_at) >= startDate).length,
          byPlan: planCounts,
        };
      }

      if (allGenerations && allGenerations.length > 0) {
        const typeCounts = allGenerations.reduce((acc: any, gen: any) => {
          acc[gen.generation_type] = (acc[gen.generation_type] || 0) + 1;
          return acc;
        }, {});

        const statusCounts = allGenerations.reduce((acc: any, gen: any) => {
          acc[gen.status] = (acc[gen.status] || 0) + 1;
          return acc;
        }, {});

        const avgTime = allGenerations.length > 0
          ? Math.round(allGenerations.reduce((sum, g) => sum + (g.generation_time_ms || 0), 0) / allGenerations.length)
          : 0;

        analytics.generations = {
          total: allGenerations.length,
          recent: allGenerations.filter(g => new Date(g.created_at) >= startDate).length,
          byType: typeCounts,
          byStatus: statusCounts,
          averageTime: avgTime,
        };
      }

      // Calculate revenue based on real plan data
      if (analytics.users) {
        const revenueByPlan = {
          starter: 3.99,
          monthly: 14.99,
          lifetime: 54.99,
        };

        const revenue = Object.entries(analytics.users.byPlan).reduce((acc: any, [plan, count]) => {
          const amount = revenueByPlan[plan as keyof typeof revenueByPlan] || 0;
          const totalAmount = amount * (count as number);
          acc.total += totalAmount;
          acc.byPlan[plan] = totalAmount;
          return acc;
        }, { total: 0, byPlan: {} });

        analytics.revenue = revenue;
      }

      // Generate timeline data based on real data
      analytics.timeline = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayUsers = allUsers?.filter(u =>
          new Date(u.created_at).toDateString() === date.toDateString()
        ).length || 0;

        const dayGenerations = allGenerations?.filter(g =>
          new Date(g.created_at).toDateString() === date.toDateString()
        ).length || 0;

        analytics.timeline.push({
          date: dateStr,
          users: dayUsers,
          generations: dayGenerations,
          revenue: dayUsers * 15 + dayGenerations * 2, // Simulated revenue
        });
      }
    }

    // Ensure all required fields exist
    if (!analytics.users) {
      analytics.users = { total: 0, new: 0, byPlan: {} };
    }
    if (!analytics.generations) {
      analytics.generations = { total: 0, recent: 0, byType: {}, byStatus: {}, averageTime: 0 };
    }
    if (!analytics.revenue) {
      analytics.revenue = { total: 0, byPlan: {} };
    }
    if (!analytics.timeline) {
      analytics.timeline = [];
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
