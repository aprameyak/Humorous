import Link from 'next/link';

function Icon({ src, alt, width, height }: Readonly<{ src: string; alt: string; width: number; height: number }>) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        borderRadius: '16px',
        background: '#232326',
        border: '2px solid #facc15',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    />
  );
}

export default function Home() {
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
      <div style={{
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <Icon src="/icon.png" alt="Humourous Icon" width={80} height={80} />
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#facc15',
            letterSpacing: '1px'
          }}>
            Humourous
          </h1>
        </div>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '3rem',
          opacity: 0.95,
          color: '#fafafa'
        }}>
          Welcome to Humourous – the TikTok-like joke app for endless laughs and good vibes.
        </p>
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link href="/support" style={{
            padding: '1rem 2rem',
            backgroundColor: '#232326',
            borderRadius: '8px',
            border: '1px solid #facc15',
            transition: 'all 0.3s ease',
            display: 'inline-block',
            fontSize: '1.1rem',
            fontWeight: '500',
            color: '#facc15',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
          }}>
            Support
          </Link>
          <Link href="/privacy" style={{
            padding: '1rem 2rem',
            backgroundColor: '#232326',
            borderRadius: '8px',
            border: '1px solid #facc15',
            transition: 'all 0.3s ease',
            display: 'inline-block',
            fontSize: '1.1rem',
            fontWeight: '500',
            color: '#facc15',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
          }}>
            Privacy Policy
          </Link>
        </div>
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          backgroundColor: '#232326',
          borderRadius: '12px',
          border: '1px solid #facc15',
          color: '#facc15'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '1rem',
            color: '#facc15'
          }}>
            About Humourous
          </h2>
          <p style={{
            lineHeight: '1.6',
            opacity: 0.9,
            fontWeight: 500,
            color: '#fafafa'
          }}>
            Humourous is a scrollable, TikTok-like joke app designed to keep you laughing. Enjoy endless jokes, share your favorites, and brighten your day with humor!
          </p>
        </div>
      </div>
    </div>
  )
}
