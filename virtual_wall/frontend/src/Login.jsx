import {useState,useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';

export default function Login(){
    const navigate = useNavigate();
    const location = useLocation();
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const redirectPath = location.state?.redirect || '/mainWall';
            navigate(redirectPath);
        }
    }, [location.state]);


    let handleLogin=async ()=>{
        if (!username || !password) {
            alert("Please fill in both username and password.");
            return;
        }
        try{
            const response=await fetch("http://localhost:8080/Login",{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body :JSON.stringify({
                    username,
                    password
                })
            })
            if(response.ok){
                const userdata=await response.json();
                localStorage.setItem("user",JSON.stringify(userdata));
                const redirectPath = location.state?.redirect || '/mainWall';
                navigate(redirectPath);
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
        <div style={{ minHeight: '100vh', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(120deg, #f0f4fd 0%, #e9eafc 100%)' }}>
            <div style={{ width: '100vw', background: '#22223b', color: '#fff', padding: '1.2rem 0 1rem 0', textAlign: 'center', fontSize: '2.1rem', fontWeight: 800, letterSpacing: '0.04em', boxShadow: '0 2px 12px rgba(34,34,59,0.08)', marginBottom: '2.5rem' }}>
                Altar Designer
                <span style={{ fontSize: '1.1rem', fontWeight: 400, color: '#b5b5d6', display: 'block', marginTop: '0.3em' }}>
                    Design your own altar with custom backgrounds and sacred decor
                </span>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: '#fff', padding: '2.5em 2.2em', borderRadius: '18px', boxShadow: '0 4px 24px rgba(33,150,243,0.10)', minWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2em' }}>
                    <h1 style={{ color: '#1769aa', fontWeight: 800, fontSize: '2em', marginBottom: '0.7em', letterSpacing: '0.01em' }}>Login</h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', width: '100%' }}>
                        <input type="text" placeholder="Enter username" value={username} onChange={(e)=>{setUsername(e.target.value)}}
                            style={{ padding: '0.9em 1.1em', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '1em', outline: 'none', background: '#f9fafb', marginBottom: '0.2em', transition: 'border-color 0.2s' }}
                        />
                        <input type="password" placeholder="Enter password" value={password} onChange={(e)=>{setPassword(e.target.value)}}
                            style={{ padding: '0.9em 1.1em', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '1em', outline: 'none', background: '#f9fafb', marginBottom: '0.2em', transition: 'border-color 0.2s' }}
                        />
                    </div>
                    <button onClick={handleLogin}
                        style={{ width: '100%', padding: '1em 0', background: 'linear-gradient(90deg, #2196f3 0%, #1769aa 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1em', boxShadow: '0 2px 8px rgba(33,150,243,0.10)', letterSpacing: '0.01em', marginTop: '0.5em', marginBottom: '0.5em', transition: 'background 0.2s, color 0.2s' }}
                    >Login</button>
                    <a href="/SignUp" style={{ color: '#1769aa', fontWeight: 500, textDecoration: 'none', marginTop: '0.5em', fontSize: '1em', transition: 'color 0.2s' }}
                       onMouseOver={e => e.currentTarget.style.color = '#2196f3'}
                       onMouseOut={e => e.currentTarget.style.color = '#1769aa'}
                    >Don't have an account? Sign up</a>
                </div>
            </div>
        </div>
    )
}