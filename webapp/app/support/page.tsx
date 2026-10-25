import Link from 'next/link';

export default function SupportPage() {
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
        maxWidth: '600px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '3rem',
        borderRadius: '18px',
        boxShadow: '0 8px 32px rgba(250, 204, 21, 0.15)',
        border: '2px solid #fde68a'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          fontWeight: 'bold',
          color: '#f59e42',
          letterSpacing: '1px'
        }}>
          Humorous Support
        </h1>
        <p style={{
          fontSize: '1.3rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          opacity: 0.95,
          color: '#232326'
        }}>
          For support, please contact us at{' '}
          <a 
            href="mailto:aprameyakannan@gmail.com"
            style={{
              color: '#f59e42',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            aprameyakannan@gmail.com
          </a>
        </p>
        <div style={{
          marginTop: '2.5rem',
          padding: '1.5rem',
          backgroundColor: '#fef3c7',
          borderRadius: '10px',
          border: '1px solid #fde68a',
          color: '#b45309'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            marginBottom: '1rem',
            color: '#f59e42'
          }}>
            Need Help?
          </h2>
          <p style={{
            opacity: 0.85,
            lineHeight: '1.5',
            fontWeight: 500
          }}>
            We're here to help with any questions about Humorous, technical issues, or feature requests.
          </p>
        </div>
        <Link href="/" style={{
          display: 'inline-block',
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#f59e42',
          color: '#fff',
          borderRadius: '6px',
          border: '1px solid #fde68a',
          transition: 'all 0.3s ease',
          fontSize: '1rem',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(250, 204, 21, 0.10)'
        }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}
