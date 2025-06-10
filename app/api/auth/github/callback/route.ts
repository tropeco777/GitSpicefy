import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateUser, type GitHubUser } from '@/lib/user-management';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(new URL('/auth/error?error=no_code', request.url));
    }

    console.log('GitHub callback received:', { code: code.substring(0, 10) + '...', state });

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', { ...tokenData, access_token: tokenData.access_token ? 'present' : 'missing' });

    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData);
      return NextResponse.redirect(new URL('/auth/error?error=no_token', request.url));
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const githubUser: GitHubUser = await userResponse.json();
    console.log('GitHub user:', { id: githubUser.id, login: githubUser.login, email: githubUser.email });

    if (!githubUser.id) {
      console.error('Invalid GitHub user data:', githubUser);
      return NextResponse.redirect(new URL('/auth/error?error=invalid_user', request.url));
    }

    // Create or update user in our database
    const dbUser = await createOrUpdateUser(githubUser);
    
    if (!dbUser) {
      console.error('Failed to create/update user in database');
      return NextResponse.redirect(new URL('/auth/error?error=db_error', request.url));
    }

    console.log('User authenticated successfully:', githubUser.email);

    // Create session (you can use JWT or session cookies)
    const response = NextResponse.redirect(new URL('/', request.url));

    // Set user session cookie
    response.cookies.set('user-session', JSON.stringify({
      id: dbUser.id,
      github_id: githubUser.id.toString(),
      email: githubUser.email,
      name: githubUser.name || githubUser.login,
      avatar_url: githubUser.avatar_url,
      plan: dbUser.plan,
      usage_count: dbUser.generations_used,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('GitHub auth callback error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=server_error', request.url));
  }
}
