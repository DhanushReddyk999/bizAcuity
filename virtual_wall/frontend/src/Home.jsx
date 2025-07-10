import { useNavigate } from 'react-router-dom';

export default function Home(){
    const navigate =useNavigate();

    let handleLogin =()=>{
        navigate('/Login');
    }

    let handleSignUp=()=>{
        navigate('/SignUp');
    }
     
    return (
        <div style={{ minHeight: '100vh', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)' }}>
            <div style={{ width: '100vw', background: '#22223b', color: '#fff', padding: '1.2rem 0 1rem 0', textAlign: 'center', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '0.04em', boxShadow: '0 2px 12px rgba(34,34,59,0.08)', marginBottom: '2.5rem' }}>
                Virtual Wall Designer
                <span style={{ fontSize: '1.1rem', fontWeight: 400, color: '#b5b5d6', display: 'block', marginTop: '0.3em' }}>
                    Design your own wall with custom backgrounds and images
                </span>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: '#fff', padding: '3em 2.8em', borderRadius: '22px', boxShadow: '0 8px 32px rgba(33,150,243,0.13)', minWidth: 340, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2em', animation: 'fadeIn 0.7s ease', position: 'relative' }}>
                    <h1 style={{ color: '#1769aa', fontWeight: 800, fontSize: '2em', marginBottom: '0.7em', letterSpacing: '0.01em', textAlign: 'center' }}>Welcome to Wall Decor</h1>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5em', width: '100%', justifyContent: 'center' }}>
                        <button onClick={handleLogin}
                            style={{ padding: '1em 2.2em', background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.13em', boxShadow: '0 2px 8px rgba(33,150,243,0.10)', letterSpacing: '0.01em', transition: 'background 0.2s, color 0.2s, transform 0.15s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)'}
                            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)'}
                        >Login</button>
                        <button onClick={handleSignUp}
                            style={{ padding: '1em 2.2em', background: 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.13em', boxShadow: '0 2px 8px rgba(33,150,243,0.10)', letterSpacing: '0.01em', transition: 'background 0.2s, color 0.2s, transform 0.15s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)'}
                            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)'}
                        >Sign Up</button>
                    </div>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(40px) scale(0.98); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    )
}