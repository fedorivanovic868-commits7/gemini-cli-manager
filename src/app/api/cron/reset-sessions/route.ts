import { NextRequest, NextResponse } from 'next/server';
import { resetExpiredQuotaSessions } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify this is being called by Vercel Cron
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await resetExpiredQuotaSessions();
    
    console.log('Cron job executed: Reset expired quota sessions');
    
    return NextResponse.json({
      success: true,
      message: 'Expired quota sessions reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}