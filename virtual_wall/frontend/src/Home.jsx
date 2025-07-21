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
            {/* Header */}
            <div style={{ width: '100vw', background: '#22223b', color: '#fff', padding: '1.2rem 0 1rem 0', textAlign: 'center', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '0.04em', boxShadow: '0 2px 12px rgba(34,34,59,0.08)', position: 'relative', marginBottom: '2.5rem' }}>
                Altar Designer
                <span style={{ fontSize: '1.1rem', fontWeight: 400, color: '#b5b5d6', display: 'block', marginTop: '0.3em' }}>
                    Design your own altar with custom backgrounds and sacred decor
                </span>
                {/* Login/SignUp buttons top right */}
                <div style={{ position: 'absolute', top: 18, right: 32, display: 'flex', gap: '1em' }}>
                    <button onClick={handleLogin}
                        style={{ padding: '0.45em 1.1em', background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85em', boxShadow: '0 2px 8px rgba(33,150,243,0.10)', letterSpacing: '0.01em', transition: 'background 0.2s, color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)'}
                    >Login</button>
                    <button onClick={handleSignUp}
                        style={{ padding: '0.45em 1.1em', background: 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85em', boxShadow: '0 2px 8px rgba(33,150,243,0.10)', letterSpacing: '0.01em', transition: 'background 0.2s, color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)'}
                    >Sign Up</button>
                </div>
            </div>
            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: '#fff', padding: '3em 2.8em', borderRadius: '22px', boxShadow: '0 8px 32px rgba(33,150,243,0.13)', minWidth: 340, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2em', animation: 'fadeIn 0.7s ease', position: 'relative' }}>
                    <h1 style={{ color: '#1769aa', fontWeight: 800, fontSize: '2em', marginBottom: '0.7em', letterSpacing: '0.01em', textAlign: 'center' }}>Welcome to Wall Decor</h1>
                    <button onClick={handleLogin}
                        style={{ padding: '1.1em 2.5em', background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#1769aa', fontWeight: 800, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.18em', boxShadow: '0 2px 8px rgba(33,243,150,0.10)', letterSpacing: '0.01em', marginBottom: '0.5em', transition: 'background 0.2s, color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'}
                    >Create Wall</button>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(40px) scale(0.98); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>
                </div>
            </div>
            {/* App Information Section */}
            <div style={{ maxWidth: 700, margin: '2.5em auto 0 auto', background: '#fff', borderRadius: '18px', boxShadow: '0 4px 18px rgba(33,150,243,0.10)', padding: '2.2em 2em', textAlign: 'center', color: '#22223b', fontSize: '1.13em', lineHeight: 1.7 }}>
                <h2 style={{ color: '#1769aa', fontWeight: 700, fontSize: '1.5em', marginBottom: '0.7em' }}>What is Altar Designer?</h2>
                <p>
                    Altar Designer is your creative platform to visualize and personalize your sacred space. Easily try out different altar backgrounds, add frames, garlands, candles, flowers, and more—right from your browser! Upload your own images, experiment with arrangements, and see your ideas come to life before making any real changes. Whether you're preparing for a festival, daily worship, or just exploring, our app makes altar design simple, interactive, and inspiring.
                </p>
                <ul style={{ textAlign: 'left', margin: '1.5em auto 0 auto', maxWidth: 540, color: '#22223b', fontSize: '1em', lineHeight: 1.6 }}>
                    <li>Choose from a variety of altar backgrounds and decor items</li>
                    <li>Upload and preview your own photos or artwork</li>
                    <li>Save, edit, and share your altar designs</li>
                    <li>Easy-to-use drag-and-drop interface</li>
                    <li>Perfect for home worship, temples, and event planners</li>
                </ul>
            </div>
            {/* Footer */}
            <footer style={{ width: '100vw', background: '#22223b', color: '#fff', padding: '1.1rem 0 1rem 0', textAlign: 'center', fontSize: '1.1rem', fontWeight: 500, letterSpacing: '0.01em', marginTop: '2.5em', boxShadow: '0 -2px 12px rgba(34,34,59,0.08)' }}>
                &copy; {new Date().getFullYear()} Altar Designer &mdash; Make your sacred space truly yours.<br/>
                <span style={{ fontSize: '0.98em', color: '#b5b5d6', display: 'block', marginTop: '0.5em' }}>
                    Contact us: <a href="mailto:support@altardesigner.com" style={{ color: '#43e97b', textDecoration: 'none' }}>support@altardesigner.com</a> | Phone: <a href="tel:+1234567890" style={{ color: '#43e97b', textDecoration: 'none' }}>+1 (234) 567-890</a>
                </span>
            </footer>
        </div>
    )
}