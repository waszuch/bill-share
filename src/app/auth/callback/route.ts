import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      
      const forwardedHost = request.headers.get('x-forwarded-host');
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
      
      
      const redirectUrl = forwardedHost 
        ? `${forwardedProto}://${forwardedHost}${next}`
        : `${origin}${next}`;
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const errorRedirectUrl = forwardedHost 
    ? `${forwardedProto}://${forwardedHost}/auth/auth-code-error`
    : `${origin}/auth/auth-code-error`;
  
  return NextResponse.redirect(errorRedirectUrl);
}

