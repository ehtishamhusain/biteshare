import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    // 1. Insert email into Supabase
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (dbError) {
      console.error('Supabase Error:', dbError);
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'You are already subscribed to updates!' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Database error: ' + dbError.message }, { status: 500 });
    }

    // 2. Send email via Resend
    const { data, error: emailError } = await resend.emails.send({
      from: 'BiteShare <onboarding@resend.dev>',
      to: [email],
      subject: '🌱 Welcome to the BiteShare Community!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
          <h1 style="color: #15803d; margin-bottom: 16px;">Welcome to BiteShare! 🌱</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #334155;">
            Hi there,
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #334155;">
            Thank you for subscribing to <strong>BiteShare updates</strong>! You are now part of a local movement dedicated to reducing commercial food waste and supporting neighborhood communities.
          </p>
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              <strong>What's Next?</strong> We'll share periodic updates on local surplus food rescue metrics, new partner restaurants, and sustainability impact reports in your area.
            </p>
          </div>
          <p style="font-size: 14px; color: #64748b;">
            Best regards,<br />
            <strong>The BiteShare Team</strong>
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend API Error:', emailError);
      return NextResponse.json({ error: 'Resend Error: ' + emailError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Catch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}