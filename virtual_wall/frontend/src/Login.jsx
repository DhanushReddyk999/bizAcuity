import {useState,useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import { buildApiUrl } from './config/api';
import { APP_CONSTANTS } from './config/constants';
import './login.css';

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
            alert(APP_CONSTANTS.VALIDATION_MESSAGES.REQUIRED_FIELDS);
            return;
        }
        try{
            const response=await fetch(buildApiUrl("/Login"),{
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
                // Fetch full user info (including subscription_plan)
                const res = await fetch(buildApiUrl(`/admin/user/${userdata.id}`), {
                  headers: { Authorization: `Bearer ${userdata.token}` },
                });
                let fullUser = userdata;
                if (res.ok) {
                  const userInfo = await res.json();
                  userInfo.token = userdata.token; // preserve token
                  fullUser = userInfo;
                }
                localStorage.setItem("user",JSON.stringify(fullUser));
                const redirectPath = location.state?.redirect || '/mainWall';
                // Reload the page to ensure plan features are properly loaded
                window.location.href = redirectPath;
            }
            else{
                const error=await response.text();
                alert(error);
            }
        } catch (err) {
          alert("Something went wrong while logging in.");
        }
    }

    return (
        <div className="login-container">
            <header className="login-header">
                <div className="login-header-logo">🕯️ Altar Designer</div>
                <span className="login-header-subtitle">
                    Design your own altar with custom backgrounds and sacred decor
                </span>
            </header>
            
            <main className="login-content">
                <div className="login-card">
                    <h1 className="login-title">Welcome Back</h1>
                    
                    <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <div className="login-input-group">
                            <input 
                                type="text" 
                                placeholder="Enter username" 
                                value={username} 
                                onChange={(e)=>{setUsername(e.target.value)}}
                                className="login-input"
                                required
                            />
                        </div>
                        
                        <div className="login-input-group">
                            <input 
                                type="password" 
                                placeholder="Enter password" 
                                value={password} 
                                onChange={(e)=>{setPassword(e.target.value)}}
                                className="login-input"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="login-btn"
                        >
                            Sign In
                        </button>
                    </form>
                    
                    <button 
                        onClick={() => navigate('/forgot-password')} 
                        className="login-forgot"
                    >
                        Forgot Password?
                    </button>
                    
                    <a 
                        href="/SignUp" 
                        className="login-signup-link"
                    >
                        Don't have an account? Sign up
                    </a>
                </div>
            </main>
        </div>
    )
}