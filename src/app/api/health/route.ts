import { NextRequest, NextResponse } from 'next/server';

// Health check endpoint for Docker and monitoring
export async function GET(request: NextRequest) {
  try {
    // 환경 변수 체크
    const checks = {
      openai: !!process.env.OPENAI_API_KEY,
      supabase_url: !!process.env.SUPABASE_URL,
      supabase_key: !!process.env.SUPABASE_ANON_KEY,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      status: 'healthy'
    };

    // 모든 필수 환경 변수가 있는지 확인
    const isHealthy = checks.openai && checks.supabase_url && checks.supabase_key;

    if (!isHealthy) {
      return NextResponse.json(
        {
          ...checks,
          status: 'unhealthy',
          message: 'Missing required environment variables'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(checks, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}