import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from './utils/passwordValidation';
import { buildApiUrl } from './config/api';
import { APP_CONSTANTS } from './config/constants';
import './signup.css';

export default function SignUp(){
    const navigate = useNavigate();
    const [username,setUsername]=useState('');
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({ isValid: false, errors: [], strength: 'weak' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatchError, setPasswordMatchError] = useState('');
    
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        const validation = validatePassword(newPassword);
        setPasswordValidation(validation);
        
        // Check password match when password changes
        if (confirmPassword && newPassword !== confirmPassword) {
            setPasswordMatchError('Passwords do not match');
        } else {
            setPasswordMatchError('');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        
        // Check password match
        if (password && newConfirmPassword !== password) {
            setPasswordMatchError('Passwords do not match');
        } else {
            setPasswordMatchError('');
        }
    };

    let handleSignUp=async ()=>{
        if (!passwordValidation.isValid) {
            alert(APP_CONSTANTS.VALIDATION_MESSAGES.PASSWORD_REQUIREMENTS);
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please make sure both passwords are identical.');
            return;
        }
        
        try{
            const response =await fetch(buildApiUrl("/mail-verification/register"),{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword,
                }),
            })
            if(response.ok){    
                localStorage.setItem('pendingEmail', email);
                navigate('/mailverification', { state: { email } });
            }
            else{
                const error=await response.text();
                alert(error);
            }
        } catch (err) {
          alert("Something went wrong while signing up.");
        }
    }

    const getStrengthClass = (strength) => {
        switch(strength) {
            case 'weak': return 'signup-strength-weak';
            case 'medium': return 'signup-strength-medium';
            case 'strong': return 'signup-strength-strong';
            case 'very-strong': return 'signup-strength-very-strong';
            default: return 'signup-strength-weak';
        }
    };

    return (
        <div className="signup-container">
            <header className="signup-header">
                <button
                    className="signup-home-btn"
                    onClick={() => navigate('/')}
                    title="Go to Home"
                >
                    <svg width="28" height="28" fill="#fff" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                </button>
                <div className="signup-header-logo">
                    🕯️ Altar Designer
                </div>
                <div className="signup-header-subtitle">
                    Design your own altar with custom backgrounds and sacred decor
                </div>
            </header>
            
            <main className="signup-content">
                <div className="signup-card">
                    <div className="signup-avatar">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
                        </svg>
                    </div>
                    
                    <h1 className="signup-title">Create Account</h1>
                    
                    <form className="signup-form">
                        <div className="signup-input-group">
                            <input 
                                type="text" 
                                placeholder="Enter username" 
                                value={username} 
                                onChange={(e)=>{setUsername(e.target.value)}}
                                className="signup-input"
                            />
                        </div>
                        
                        <div className="signup-input-group">
                            <input 
                                type="email" 
                                placeholder="Enter email" 
                                value={email} 
                                onChange={(e)=>{setEmail(e.target.value)}}
                                className="signup-input"
                            />
                        </div>
                        
                        <div className="signup-password-container">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter password" 
                                value={password} 
                                onChange={handlePasswordChange}
                                className="signup-password-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="signup-password-toggle"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        
                        {password.length > 0 && (
                            <div className="signup-password-strength">
                                <div className="signup-strength-label">
                                    <span>Strength:</span>
                                    <span 
                                        className="signup-strength-text"
                                        style={{ color: getPasswordStrengthColor(passwordValidation.strength) }}
                                    >
                                        {getPasswordStrengthText(passwordValidation.strength)}
                                    </span>
                                </div>
                                <div className="signup-strength-bar">
                                    <div className={`signup-strength-fill ${getStrengthClass(passwordValidation.strength)}`} />
                                </div>
                            </div>
                        )}
                        
                        {passwordValidation.errors.length > 0 && (
                            <div className="signup-errors">
                                {passwordValidation.errors.map((error, index) => (
                                    <div key={index} className="signup-error-item">• {error}</div>
                                ))}
                            </div>
                        )}
                        
                        <div className="signup-password-container">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm password" 
                                value={confirmPassword} 
                                onChange={handleConfirmPasswordChange}
                                className="signup-password-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="signup-password-toggle"
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        
                        {passwordMatchError && (
                            <div className="signup-errors">
                                <div className="signup-error-item">• {passwordMatchError}</div>
                            </div>
                        )}
                    </form>
                    
                    <button onClick={handleSignUp} className="signup-btn">
                        Sign Up
                    </button>
                    
                    <a href="/Login" className="signup-login-link">
                        Already have an account? Login
                    </a>
                </div>
            </main>
        </div>
    )
}