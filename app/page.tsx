import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Humourous!</h1>
      <p>A scrollable, TikTok-like joke app.</p>
      <nav style={{ marginTop: '2rem' }}>
        <Link href="/support" style={{ marginRight: '2rem' }}>Support</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </nav>
    </main>
  );
}
