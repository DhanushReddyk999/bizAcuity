import { useNavigate } from 'react-router-dom';
import './home.css';

export default function Home(){
    const navigate =useNavigate();

    let handleLogin =()=>{
        navigate('/Login');
    }

    let handleSignUp=()=>{
        navigate('/SignUp');
    }
     
    return (
        <div className="home-root">
            {/* New Modern Header */}
            <header className="new-header">
                <div className="new-header-left">
                    <div className="new-header-logo">🕯️ Altar Designer</div>
                </div>
                <nav className="new-header-center">
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#demo">Demo</a>
                    <a href="#testimonials">Testimonials</a>
                    <a href="#contact">Contact</a>
                </nav>
                <div className="new-header-right">
                    <button onClick={handleLogin} className="new-header-btn login">Login</button>
                    <button onClick={handleSignUp} className="new-header-btn signup">Sign Up</button>
            </div>
            </header>
            {/* Hero Section */}
            <section className="home-hero-section" id="home">
                <div className="home-hero-bg">
                    <img src="/CottageWall.jpg" alt="Decorative Banner" className="home-hero-img" />
                    <div className="home-hero-content">
                        <h1 className="home-hero-title">Design Your Own Sacred Space</h1>
                        <p className="home-hero-subtitle">Create, customize, and visualize your altar with beautiful backgrounds and decor. No design skills needed!</p>
                        <button onClick={handleLogin} className="home-hero-cta">Create Wall</button>
                </div>
            </div>
            </section>

            {/* App Introduction Section */}
            <section className="home-app-intro-section">
                <h2 className="home-app-intro-title">What is Altar Designer?</h2>
                <p className="home-app-intro-desc">
                    Altar Designer is your creative platform to visualize and personalize your sacred space. 
                    Whether you're preparing for a festival, daily worship, or just exploring, our app makes 
                    altar design simple, interactive, and inspiring.
                </p>
                <div className="home-app-intro-points">
                    <div className="home-app-intro-point">
                        <span className="home-app-intro-icon">🎨</span>
                        <h4>Visual Design</h4>
                        <p>Create beautiful altar layouts with drag-and-drop ease</p>
                    </div>
                    <div className="home-app-intro-point">
                        <span className="home-app-intro-icon">📱</span>
                        <h4>Easy to Use</h4>
                        <p>No design skills needed - intuitive interface for everyone</p>
                    </div>
                    <div className="home-app-intro-point">
                        <span className="home-app-intro-icon">💾</span>
                        <h4>Save & Share</h4>
                        <p>Save your designs and share with family and friends</p>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="home-features-section" id="features">
                <h2 className="home-features-title">Key Features</h2>
                <div className="home-features-list">
                    <div className="home-feature-item">
                        <span className="home-feature-icon">🎨</span>
                        <div className="home-feature-content">
                            <h3>Decor Variety</h3>
                            <p>Choose from candles, garlands, frames, flowers, and more to personalize your altar.</p>
                        </div>
                    </div>
                    <div className="home-feature-item">
                        <span className="home-feature-icon">📤</span>
                        <div className="home-feature-content">
                            <h3>Upload Images</h3>
                            <p>Upload and preview your own photos or artwork for a truly personal touch.</p>
                        </div>
                    </div>
                    <div className="home-feature-item">
                        <span className="home-feature-icon">💾</span>
                        <div className="home-feature-content">
                            <h3>Save & Edit</h3>
                            <p>Save your altar designs, edit them anytime, and keep your creative ideas safe.</p>
                        </div>
                    </div>
                    <div className="home-feature-item">
                        <span className="home-feature-icon">📤</span>
                        <div className="home-feature-content">
                            <h3>Share Designs</h3>
                            <p>Share your altar creations with friends, family, or your community easily.</p>
                        </div>
                    </div>
                    <div className="home-feature-item">
                        <span className="home-feature-icon">🎯</span>
                        <div className="home-feature-content">
                            <h3>Drag & Drop</h3>
                            <p>Intuitive drag and drop interface for easy placement and arrangement of elements.</p>
                        </div>
                    </div>
                    <div className="home-feature-item">
                        <span className="home-feature-icon">👁️</span>
                        <div className="home-feature-content">
                            <h3>Real-time Preview</h3>
                            <p>See your changes instantly as you design, with live preview of your altar layout.</p>
                        </div>
                    </div>
                    <div className="home-feature-item">
                        <span className="home-feature-icon">📱</span>
                        <div className="home-feature-content">
                            <h3>Mobile Friendly</h3>
                            <p>Design your altar on any device - desktop, tablet, or mobile phone.</p>
                        </div>
                    </div>
                    <div className="home-feature-item">
                        <span className="home-feature-icon">💾</span>
                        <div className="home-feature-content">
                            <h3>Export Options</h3>
                            <p>Download your altar designs as images to print or share on social media.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="home-how-section" id="demo">
                <h2 className="home-how-title">How It Works</h2>
                <div className="home-how-steps">
                    <div className="home-how-step">
                        <span className="home-how-step-num">1</span>
                        <h4>Choose a Background</h4>
                        <p>Select from a variety of beautiful altar backgrounds or upload your own.</p>
                    </div>
                    <div className="home-how-step">
                        <span className="home-how-step-num">2</span>
                        <h4>Decorate & Arrange</h4>
                        <p>Drag and drop decor items, frames, garlands, and more to create your altar.</p>
                    </div>
                    <div className="home-how-step">
                        <span className="home-how-step-num">3</span>
                        <h4>Save & Share</h4>
                        <p>Save your design, edit anytime, and share with friends or your community.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="home-testimonials-section" id="testimonials">
                <h2 className="home-testimonials-title">What Our Users Say</h2>
                <div className="home-testimonials-list">
                    <div className="home-testimonial">
                        <img src="/frame2.jpg" alt="User" className="home-testimonial-avatar" />
                        <blockquote>“This app made it so easy to visualize my festival altar. The drag-and-drop is super intuitive!”</blockquote>
                        <span className="home-testimonial-user">— Priya S.</span>
                    </div>
                    <div className="home-testimonial">
                        <img src="/table2.jpg" alt="User" className="home-testimonial-avatar" />
                        <blockquote>“I love being able to try different backgrounds and decor before setting up at home. Highly recommended!”</blockquote>
                        <span className="home-testimonial-user">— Arjun M.</span>
                    </div>
                </div>
            </section>

            {/* Bottom CTA Section */}
            <section className="home-bottom-cta-section">
                <h2>Ready to Create Your Own Altar?</h2>
                <button onClick={handleLogin} className="home-bottom-cta-btn">Start Designing Now</button>
            </section>

            {/* Contact Section */}
            <section className="home-contact-section" id="contact">
                <h2 className="home-contact-title">Need Help? Contact Us Now!</h2>
                <p className="home-contact-desc">Thank you for your interest. Please fill out the form and we will get back to you promptly regarding your request.</p>
                
                <div className="home-contact-layout">
                    <div className="home-contact-form-blob">
                        <h3>Please fill this form</h3>
                        <form className="home-contact-form" onSubmit={e => e.preventDefault()}>
                            <input className="home-contact-input" type="text" placeholder="Full Name" required />
                            <input className="home-contact-input" type="email" placeholder="Email Address" required />
                            <input className="home-contact-input" type="tel" placeholder="Phone Number" required />
                            <select className="home-contact-input">
                                <option value="">Service You want</option>
                                <option value="support">Technical Support</option>
                                <option value="feedback">Feedback</option>
                                <option value="feature">Feature Request</option>
                                <option value="general">General Inquiry</option>
                            </select>
                            <textarea className="home-contact-textarea" placeholder="Message" rows="4" required></textarea>
                            <button className="home-contact-btn" type="submit">Send Message</button>
                        </form>
                    </div>

                    <div className="home-contact-details">
                        <div className="home-contact-availability">
                            <span>We are available</span>
                            <span className="highlight">24/7</span>
                        </div>
                        <p className="home-contact-info-text">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <div className="home-contact-info">
                            <div className="home-contact-info-item">
                                <span className="home-contact-info-icon">📞</span>
                                <span>+1-760-284-3410</span>
                            </div>
                            <div className="home-contact-info-item">
                                <span className="home-contact-info-icon">📧</span>
                                <span>hello@altardesigner.com</span>
                            </div>
                            <div className="home-contact-info-item">
                                <span className="home-contact-info-icon">📍</span>
                                <span>931 Abia Martin Drive, PA Pennsylvania-18104</span>
                            </div>
                        </div>
                        <div className="home-contact-social">
                            <a href="https://facebook.com/altardesigner" target="_blank" rel="noopener noreferrer" className="home-social-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="https://twitter.com/altardesigner" target="_blank" rel="noopener noreferrer" className="home-social-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                            <a href="https://instagram.com/altardesigner" target="_blank" rel="noopener noreferrer" className="home-social-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
            </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-cols">
                    <div className="home-footer-col">
                        <h4>About</h4>
                        <p>Altar Designer helps you visualize and create your sacred space online. Simple, creative, and free to use.</p>
                    </div>
                    <div className="home-footer-col">
                        <h4>Quick Links</h4>
                        <a href="#home">Home</a>
                        <a href="#features">Features</a>
                        <a href="#demo">Demo</a>
                        <a href="#testimonials">Testimonials</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <div className="home-footer-col">
                        <h4>Contact</h4>
                        <a href="mailto:support@altardesigner.com">support@altardesigner.com</a><br/>
                        <a href="tel:+1234567890">+1 (234) 567-890</a>
                    </div>
                    <div className="home-footer-col">
                        <h4>Social</h4>
                        <a href="https://instagram.com/altardesigner" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="https://facebook.com/altardesigner" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://twitter.com/altardesigner" target="_blank" rel="noopener noreferrer">Twitter</a>
                    </div>
                </div>
                <div className="home-footer-divider"></div>
                <div className="home-footer-bottom">
                    &copy; {new Date().getFullYear()} Altar Designer. All rights reserved.
                </div>
            </footer>
        </div>
    )
}