import Link from 'next/link';

export default function Privacy() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '800px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Privacy Policy
        </h1>
        <div style={{
          lineHeight: '1.8',
          fontSize: '1.1rem'
        }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#ffd700'
            }}>
              Data Collection
            </h2>
            <p style={{ opacity: 0.9 }}>
              Humourous is designed with privacy in mind. We collect minimal data to provide you with the best experience:
            </p>
            <ul style={{
              marginTop: '1rem',
              paddingLeft: '2rem',
              opacity: 0.9
            }}>
              <li>We only collect data necessary to personalize your experience and improve the app</li>
              <li>No sharing of personal data with third parties without your consent</li>
              <li>All data is securely stored and encrypted</li>
              <li>You can request deletion of your data at any time</li>
            </ul>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#ffd700'
            }}>
              How Data is Used
            </h2>
            <p style={{ opacity: 0.9 }}>
              Data collected is used solely to personalize your experience and improve Humourous. We do not use your data for advertising or marketing purposes.
            </p>
            <ul style={{
              marginTop: '1rem',
              paddingLeft: '2rem',
              opacity: 0.9
            }}>
              <li>Your data is used only to enhance your experience in the app</li>
              <li>No data is shared with third parties</li>
              <li>No advertising or marketing based on your usage</li>
            </ul>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#ffd700'
            }}>
              Contact Information
            </h2>
            <p style={{ opacity: 0.9 }}>
              If you have any questions about this privacy policy or how we handle your data, please contact us at:{' '}
              <a 
                href="mailto:aprameyakannan@gmail.com"
                style={{
                  color: '#ffd700',
                  textDecoration: 'underline',
                  fontWeight: '600'
                }}
              >
                aprameyakannan@gmail.com
              </a>
            </p>
          </section>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#ffd700'
            }}>
              Data Security
            </h2>
            <p style={{ opacity: 0.9 }}>
              Your privacy is our priority. All your data is securely stored and encrypted. We comply with privacy regulations such as GDPR and CCPA.
            </p>
          </section>
          <section>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#ffd700'
            }}>
              Updates to This Policy
            </h2>
            <p style={{ opacity: 0.9 }}>
              We may update this privacy policy from time to time. Any changes will be reflected here and we encourage you to review this policy periodically.
            </p>
          </section>
        </div>
        <div style={{
          textAlign: 'center',
          marginTop: '3rem'
        }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease',
            fontSize: '1rem'
          }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
