'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LaughALotPage() {
  const [topic, setTopic] = useState('');
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: topic.trim() ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: topic.trim() ? JSON.stringify({ topic: topic.trim() }) : undefined
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data: { message: string } = await response.json();
      setJoke(data.message);
    } catch {
      setJoke('Failed to fetch joke. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif',
      background: '#18181b',
      color: '#fafafa'
    }}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#facc15',
          letterSpacing: '1px',
          marginBottom: '1rem'
        }}>
          LaughALot
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.95 }}>
          Enter a topic for a targeted joke, or leave it blank for a random one.
        </p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !loading) generate(); }}
          placeholder="Enter a topic"
          aria-label="Joke topic"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.9rem 1rem',
            fontSize: '1.1rem',
            borderRadius: '8px',
            border: '1px solid #facc15',
            background: '#232326',
            color: '#fafafa',
            marginBottom: '1rem'
          }}
        />
        <button
          onClick={generate}
          disabled={loading}
          style={{
            padding: '0.9rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: '8px',
            border: '1px solid #facc15',
            background: '#facc15',
            color: '#18181b',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Thinking...' : 'Generate Joke'}
        </button>
        {joke && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#232326',
            borderRadius: '12px',
            border: '1px solid #facc15',
            lineHeight: '1.6',
            fontWeight: 500
          }}>
            {joke}
          </div>
        )}
        <Link href="/" style={{
          display: 'inline-block',
          marginTop: '2.5rem',
          color: '#38bdf8',
          textDecoration: 'none',
          fontWeight: 500
        }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
