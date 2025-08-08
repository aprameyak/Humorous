import Link from 'next/link';

function Icon({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        borderRadius: '20%',
        boxShadow: '0 2px 12px rgba(250, 204, 21, 0.15)',
        background: '#fffbe6',
        border: '2px solid #facc15'
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
      background: 'linear-gradient(135deg, #facc15 0%, #fbbf24 100%)',
      color: '#232326'
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
            color: '#f59e42',
            letterSpacing: '1px'
          }}>
            Humourous
          </h1>
        </div>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '3rem',
          opacity: 0.95,
          color: '#232326'
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
            backgroundColor: '#f59e42',
            borderRadius: '8px',
            border: '1px solid #fde68a',
            transition: 'all 0.3s ease',
            display: 'inline-block',
            fontSize: '1.1rem',
            fontWeight: '500',
            color: '#fff',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(250, 204, 21, 0.10)'
          }}>
            Support
          </Link>
          <Link href="/privacy" style={{
            padding: '1rem 2rem',
            backgroundColor: '#f59e42',
            borderRadius: '8px',
            border: '1px solid #fde68a',