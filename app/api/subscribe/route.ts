import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// 🛡️ Create a server-side Supabase client using Service Role (or Anon Key fallback)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Save subscriber to Supabase database using supabaseAdmin
    const { error: dbError } = await supabaseAdmin
      .from('subscribers')
      .upsert(
        { email: cleanEmail, created_at: new Date().toISOString() },
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('Supabase DB Insert Error:', dbError);
      return NextResponse.json(
        { error: `Database Error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 2. Dynamically detect current domain (localhost:3000 vs biteshare.in)
    const host = req.headers.get('host') || 'biteshare.in';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const unsubscribeUrl = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(cleanEmail)}`;

    // 3. Send Welcome Email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'BiteShare <support@biteshare.in>',
      to: [cleanEmail],
      subject: 'Welcome to BiteShare! You’re officially on the list!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 24px; color: #1e293b; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: -0.6px; line-height: 1.2;">
              Bite<span style="color: #059669;">Share</span>
            </h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 6px; margin-bottom: 0; font-weight: 500;">
              Hyper-Local Food Redistribution Network
            </p>
          </div>

          <div style="padding: 24px 0;">
            <h2 style="font-size: 19px; color: #0f172a; margin-bottom: 14px; font-weight: 800; text-align: center;">
              Thanks for subscribing! 🎉
            </h2>
            
            <p style="font-size: 14px; line-height: 1.65; color: #334155; margin-bottom: 16px;">
              At <strong>BiteShare</strong>, our primary mission is to ensure that no one goes to bed hungry. We are building a platform that connects surplus food from restaurants and bakeries directly with community members and shelters, reducing food waste while making meals more accessible to those who need them most.
            </p>
            
            <p style="font-size: 14px; line-height: 1.65; color: #334155; margin-bottom: 20px;">
              You are now part of this journey. We’ll keep you updated on platform milestones, feature releases, and community impact as we work together toward zero hunger and zero food waste.
            </p>

            <div style="margin: 28px 0; padding: 22px 20px; background-color: #f0fdf4; border-radius: 16px; border: 1px solid #bbf7d0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 15px; color: #166534; font-weight: 800;">
                Get Started Today
              </p>
              <p style="margin: 0 0 18px 0; font-size: 13px; color: #15803d; line-height: 1.4;">
                Whether you want to share surplus food or claim fresh meals, pick your role below:
              </p>

              <div style="text-align: center;">
                
                <a 
                  href="${baseUrl}/signup" 
                  style="background-color: #059669; color: #ffffff; padding: 12px 18px; border-radius: 12px; font-weight: 800; text-decoration: none; display: inline-block; font-size: 13px; margin: 5px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.25);"
                >
                  🏪 Publish Food
                </a>

                <a 
                  href="${baseUrl}/feed" 
                  style="background-color: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 12px; font-weight: 800; text-decoration: none; display: inline-block; font-size: 13px; margin: 5px; box-shadow: 0 2px 4px rgba(15, 23, 42, 0.2);"
                >
                  🍲 Explore Feed
                </a>

              </div>
            </div>
          </div>

          <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 8px 0;">Together toward zero hunger & zero food waste,<br/><strong style="color: #475569;">The BiteShare Team</strong></p>
            <p style="margin: 0 0 12px 0;"><a href="${baseUrl}" style="color: #059669; text-decoration: none; font-weight: 600;">${baseUrl}</a></p>
            
            <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">
              Didn't mean to subscribe or changed your mind? 
              <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline; font-weight: 600;">
                Click here to Unsubscribe
              </a>
            </p>
          </div>

        </div>
      `,
    });

    if (emailError) {
      console.error('Resend API Error:', emailError);
      return NextResponse.json(
        { error: 'Saved to database, but welcome email failed to send.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error: any) {
    console.error('Subscribe Server Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}