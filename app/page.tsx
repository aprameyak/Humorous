import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Humourous!</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>
        A scrollable, TikTok-like joke app.
      </p>
      <nav>
        <Link href="/support">Support</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </nav>
    </main>
  );
}
