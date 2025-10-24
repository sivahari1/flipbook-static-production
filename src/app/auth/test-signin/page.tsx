export default function TestSignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Test Sign In (Server Component)
        </h1>
        
        <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
          This is a server-rendered page to test if the basic structure works.
        </p>
        
        <div style={{ textAlign: 'center' }}>
          <a 
            href="/auth/simple-signin" 
            style={{ 
              color: '#3b82f6', 
              textDecoration: 'underline',
              marginRight: '1rem'
            }}
          >
            Simple Sign In
          </a>
          <a 
            href="/debug-auth" 
            style={{ 
              color: '#3b82f6', 
              textDecoration: 'underline'
            }}
          >
            Debug Page
          </a>
        </div>
      </div>
    </div>
  )
}