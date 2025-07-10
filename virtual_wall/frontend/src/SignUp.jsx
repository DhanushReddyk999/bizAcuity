import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function SignUp(){
    const navigate = useNavigate();
    const [username,setUsername]=useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    
    let handleSignUp=async ()=>{
        try{
            const response =await fetch("http://localhost:8080/SignUp",{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            })
            if(response.ok){    
                navigate('/Login');
            }
            else{
                const error=await response.text();
                alert(error);
            }
        }
        catch(err){
            console.log(err);
        }
    }

    return (
        <center>
        <div style={{ minHeight: '100vh', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)' }}>
            <div style={{ width: '100vw', background: '#22223b', color: '#fff', padding: '1.2rem 0 1rem 0', textAlign: 'center', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '0.04em', boxShadow: '0 2px 12px rgba(34,34,59,0.08)', marginBottom: '2.5rem' }}>
                Virtual Wall Designer
                <span style={{ fontSize: '1.1rem', fontWeight: 400, color: '#b5b5d6', display: 'block', marginTop: '0.3em' }}>
                    Design your own wall with custom backgrounds and images
                </span>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                    background: '#fff',
                    padding: '3em 2.8em',
                    borderRadius: '22px',
                    boxShadow: '0 8px 32px rgba(33,150,243,0.13)',
                    minWidth: 340,
                    maxWidth: 420,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.7em',
                    transform: 'translateX(-50px)',
                    animation: 'fadeIn 0.7s ease',
                    position: 'relative'
                }}>
                    <div style={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2196f3 60%, #1769aa 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.2em',
                        boxShadow: '0 2px 12px rgba(33,150,243,0.10)'
                    }}>
                        <svg width="38" height="38" fill="#fff" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
                    </div>
                    <h1 style={{ color: '#1769aa', fontWeight: 800, fontSize: '2em', marginBottom: '0.7em', letterSpacing: '0.01em' }}>Sign Up</h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3em', width: '100%' }}>
                        <input type="text" placeholder="Enter username" value={username} onChange={(e)=>{setUsername(e.target.value)}}
                            style={{ padding: '1.1em 1.2em', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '1.08em', outline: 'none', background: '#f9fafb', marginBottom: '0.2em', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: '0 1px 4px rgba(33,150,243,0.04)', fontWeight: 500 }}
                            onFocus={e => e.target.style.borderColor = '#2196f3'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <input type="email" placeholder="Enter email" value={email} onChange={(e)=>{setEmail(e.target.value)}}
                            style={{ padding: '1.1em 1.2em', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '1.08em', outline: 'none', background: '#f9fafb', marginBottom: '0.2em', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: '0 1px 4px rgba(33,150,243,0.04)', fontWeight: 500 }}
                            onFocus={e => e.target.style.borderColor = '#2196f3'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <input type="password" placeholder="Enter password" value={password} onChange={(e)=>{setPassword(e.target.value)}}
                            style={{ padding: '1.1em 1.2em', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '1.08em', outline: 'none', background: '#f9fafb', marginBottom: '0.2em', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: '0 1px 4px rgba(33,150,243,0.04)', fontWeight: 500 }}
                            onFocus={e => e.target.style.borderColor = '#2196f3'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                    <button onClick={handleSignUp}
                        style={{ width: '100%', padding: '1.1em 0', background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.13em', boxShadow: '0 2px 8px rgba(33,150,243,0.10)', letterSpacing: '0.01em', marginTop: '0.5em', marginBottom: '0.5em', transition: 'background 0.2s, color 0.2s, transform 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1769aa 0%, #2196f3 100%)'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)'}
                    >Sign Up</button>
                    <a href="/Login" style={{ color: '#1769aa', fontWeight: 500, textDecoration: 'none', marginTop: '0.5em', fontSize: '1.05em', transition: 'color 0.2s' }}
                       onMouseOver={e => e.currentTarget.style.color = '#2196f3'}
                       onMouseOut={e => e.currentTarget.style.color = '#1769aa'}
                    >Already have an account? Login</a>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(40px) scale(0.98); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>
                </div>
            </div>
        </div>
        </center>
    )
}