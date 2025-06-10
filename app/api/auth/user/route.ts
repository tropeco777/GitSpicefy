import { NextRequest, NextResponse } from 'next/server';
import { getUserByGitHubId } from '@/lib/user-management';

export async function GET(request: NextRequest) {
  try {
    const userSession = request.cookies.get('user-session')?.value;
    
    if (!userSession) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const sessionData = JSON.parse(userSession);
    console.log('Getting user session:', sessionData.email);

    // Get fresh user data from database
    const user = await getUserByGitHubId(sessionData.github_id);
    
    if (!user) {
      // Clear invalid session
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete('user-session');
      return response;
    }

    // Update session with fresh data
    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set('user-session', JSON.stringify({
      id: user.id,
      github_id: sessionData.github_id,
      email: sessionData.email,
      name: sessionData.name,
      avatar_url: sessionData.avatar_url,
      plan: user.plan,
      usage_count: user.generations_used,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Get user session error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('Logging out user');
    
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete('user-session');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
