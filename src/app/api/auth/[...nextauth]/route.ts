import { updateLastLogin } from '@/lib/services/authService';

// ... existing imports ...

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    // ... existing authentication logic ...

    // After successful authentication
    await updateLastLogin(user.id, user.role.toLowerCase());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
} 