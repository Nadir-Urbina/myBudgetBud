import { redirect } from 'next/navigation';

// Add static export config for more efficient redirect
export const dynamic = 'force-static';
export const revalidate = false;

export default function Home() {
  redirect('/marketing');
}
