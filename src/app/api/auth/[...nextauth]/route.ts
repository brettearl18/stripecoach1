import { NextResponse } from 'next/server';
import { updateLastLogin } from '@/lib/services/authService';
import { cookies } from 'next/headers';

// ... existing imports ...

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: 'No request body' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Mock authentication - replace with your actual auth logic
    const user = { id: '1', email, role: 'coach', name: 'Coach User' };
    await updateLastLogin(user.id, user.role.toLowerCase());

    // Set user data in cookies
    cookies().set('user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        ...user,
        role: user.role // Ensure role is included in the response
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export async function GET() {
  // Return the user data from cookies if available
  const userCookie = cookies().get('user');
  if (userCookie?.value) {
    try {
      const userData = JSON.parse(userCookie.value);
      return NextResponse.json({ 
        status: 'ok',
        user: userData
      });
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }
  return NextResponse.json({ status: 'ok' });
} 