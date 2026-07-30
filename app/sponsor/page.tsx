import { redirect } from 'next/navigation';

export default function SponsorMealPage() {
  // 🔄 Server-side redirect to HomePage while sponsorships are paused
  redirect('/');
}