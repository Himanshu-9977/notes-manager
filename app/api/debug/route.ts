import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  // Check if user is authenticated
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only return environment variable existence, not values
  const envStatus = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    envStatus,
    timestamp: new Date().toISOString(),
  });
}
