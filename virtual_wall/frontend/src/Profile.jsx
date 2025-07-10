import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate('/Login'); // redirect if not logged in
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <>
        <div className="appHeader">
          Virtual Wall Designer
          <span>Design your own wall with custom backgrounds and images</span>
        </div>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', background: 'linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)' }}>
          <div style={{ marginLeft: '5vw', border: '4px solid #e9eafc', borderTop: '4px solid #2196f3', borderRadius: '50%', width: 48, height: 48, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="appHeader">
        Virtual Wall Designer
        <span>Design your own wall with custom backgrounds and images</span>
      </div>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', background: 'linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)' }}>
        <div style={{ marginLeft: '5vw', height: '100vh', background: 'linear-gradient(135deg, #fff 60%, #e9eafc 100%)', boxShadow: '0 8px 32px rgba(33,150,243,0.13)', borderRadius: '22px', padding: '2.5rem 2.8rem', maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5em', justifyContent: 'space-between' }}>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5em' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #2196f3 60%, #1769aa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5em', boxShadow: '0 2px 12px rgba(33,150,243,0.10)' }}>
              <svg width="54" height="54" fill="#fff" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
            </div>
            <h1 style={{ color: '#1769aa', fontWeight: 800, fontSize: '2em', marginBottom: '0.2em', letterSpacing: '0.01em' }}>Profile</h1>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
              <div style={{ background: '#e9eafc', padding: '1.1em', borderRadius: '10px', boxShadow: '0 1px 4px rgba(33,150,243,0.06)', width: '100%' }}>
                <span style={{ color: '#1769aa', fontWeight: 700, fontSize: '1.08em' }}>Username</span>
                <div style={{ fontSize: '1.13em', marginTop: '0.3em', fontWeight: 500 }}>{user.username}</div>
              </div>
              <div style={{ background: '#e9eafc', padding: '1.1em', borderRadius: '10px', boxShadow: '0 1px 4px rgba(33,150,243,0.06)', width: '100%' }}>
                <span style={{ color: '#1769aa', fontWeight: 700, fontSize: '1.08em' }}>Email</span>
                <div style={{ fontSize: '1.13em', marginTop: '0.3em', fontWeight: 500 }}>{user.email}</div>
              </div>
              {user.message && (
                <div style={{ background: '#e9eafc', padding: '1.1em', borderRadius: '10px', boxShadow: '0 1px 4px rgba(33,150,243,0.06)', width: '100%' }}>
                  <span style={{ color: '#1769aa', fontWeight: 700, fontSize: '1.08em' }}>Message</span>
                  <div style={{ fontSize: '1.13em', marginTop: '0.3em', fontWeight: 500 }}>{user.message}</div>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("user");
              navigate('/Login');
            }} 
            style={{ marginTop: '0.5em', padding: '1em 2.2em', background: 'linear-gradient(90deg, #ff4d4d 0%, #ff7b7b 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.13em', boxShadow: '0 2px 8px rgba(255,77,77,0.10)', letterSpacing: '0.01em', transition: 'background 0.2s, color 0.2s, transform 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ff7b7b 0%, #ff4d4d 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ff4d4d 0%, #ff7b7b 100%)'}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}