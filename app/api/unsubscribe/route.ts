import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse(
        `<html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Invalid Request</h2>
            <p>No email address was provided.</p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' }, status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Delete subscriber from Supabase database
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('email', cleanEmail);

    if (error) {
      console.error('Supabase Unsubscribe Error:', error);
    }

    // 2. Return a clean HTML success page
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Unsubscribed - BiteShare</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
          <div style="max-width: 460px; width: 100%; background: #ffffff; padding: 36px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
            <div style="background-color: #f1f5f9; width: 52px; height: 52px; border-radius: 16px; line-height: 52px; margin: 0 auto 16px; color: #64748b; font-size: 22px; font-weight: bold;">
              ✓
            </div>
            <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 8px; color: #0f172a;">You've been unsubscribed</h1>
            <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px;">
              <strong style="color: #334155;">${cleanEmail}</strong> has been removed from our subscriber list. You will no longer receive update emails from BiteShare.
            </p>
            <a href="https://biteshare.in" style="background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 14px; display: inline-block;">
              Return to BiteShare
            </a>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 200 }
    );
  } catch (err: any) {
    console.error('Unsubscribe Server Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}