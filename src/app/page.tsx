'use client';

import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import "./landing.css";
// @ts-ignore
import SplitText from "@/components/reactbits/SplitText";
// @ts-ignore
import SpotlightCard from "@/components/reactbits/SpotlightCard";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline();
    
    tl.from(".nav-container", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    })
    .from(".hero-line-reveal", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out"
    }, "-=0.5")
    .from(".hero-desc-reveal", {
        opacity: 0,
        y: 20,
        duration: 0.8
    }, "-=0.5")
    .from(".hero-btn-reveal", {
        scale: 0.9,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6
    }, "-=0.4")
    .from(".hero-visual", {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    }, "-=0.8");

    // Scroll Triggers for Sections
    gsap.utils.toArray('.reveal-section').forEach((section: any) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "out"
        });
    });

    // Staggered Features
    gsap.from(".feature-box", {
        scrollTrigger: {
            trigger: ".feature-section",
            start: "top 75%"
        },
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)"
    });

  }, { scope: containerRef });

  const toggleFaq = (index: number) => {
      setActiveFaq(activeFaq === index ? null : index);
  }

  return (
    <div ref={containerRef} className="landing-wrapper">
      {/* Texture Overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-content">
            <a href="/" className="brand-mark">
            <span className="brand-dot"></span>
            BloodReq
            </a>
            
            <div className="nav-links hidden md:flex">
                <a href="#mission">Mission</a>
                <a href="#impact">Platform</a>
                <a href="#app">The App</a>
                <a href="#faq">FAQ</a>
            </div>
            
            <div className="nav-actions">
                <a href="/login" className="link-subtle">Sign In</a>
                <button className="btn-accent">Get App</button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid">
            <div className="hero-content">
                <div className="label-caps mb-6 hero-line-reveal">Lifesaving Network</div>
                <div className="hero-heading-wrapper">
                    <div className="hero-line-reveal">
                        <h1 className="hero-heading">Pulse of</h1>
                    </div>
                    <div className="hero-line-reveal">
                        <h1 className="hero-heading text-crimson">Humanity</h1>
                    </div>
                </div>
                <p className="hero-description mt-8 hero-desc-reveal">
                    The advanced platform connecting donors to patients in critical need. 
                    Real-time geolocation matching. Instant verification. Zero delays.
                </p>
                <div className="hero-ctas mt-10">
                    <button className="btn-primary hero-btn-reveal">Find a Donor</button>
                    <button className="btn-outline hero-btn-reveal">Become a Donor</button>
                </div>
            </div>
            <div className="hero-visual">
                <div className="visual-card">
                    <div className="live-indicator">
                        <span className="blink-dot"></span>
                        Live Network Activity
                    </div>
                    
                    {/* Abstract Data Visualization */}
                    <div className="data-viz-container">
                        <div className="scan-line"></div>
                        <div className="data-points">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="data-point" style={{
                                    top: `${Math.random() * 80 + 10}%`,
                                    left: `${Math.random() * 80 + 10}%`,
                                    animationDelay: `${i * 0.5}s`
                                }}>
                                    <div className="pulse-ring"></div>
                                </div>
                            ))}
                        </div>
                         <div className="connection-lines">
                             <svg width="100%" height="100%">
                                 <path d="M40,50 Q100,100 180,60" fill="none" stroke="rgba(220, 38, 38, 0.4)" strokeWidth="1" strokeDasharray="5,5" className="dash-anim" />
                                 <path d="M180,60 Q200,200 80,180" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                             </svg>
                         </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-num">42s</span>
                            <span className="stat-lbl">Avg. Match Time</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-num">8.4k</span>
                            <span className="stat-lbl">Active Donors</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap">
          <div className="ticker">
              <span className="ticker-item">A+ AVAILABLE - TOKYO</span> •
              <span className="ticker-item text-crimson">O- URGENT REQUEST - MUMBAI</span> •
              <span className="ticker-item">B+ MATCHED - LONDON</span> •
              <span className="ticker-item">AB- AVAILABLE - NYC</span> •
              <span className="ticker-item">A+ AVAILABLE - BERLIN</span> •
              <span className="ticker-item text-crimson">B- CRITICAL - DELHI</span> •
              <span className="ticker-item">O+ DONOR READY - PARIS</span> •
          </div>
      </div>

      {/* Process Section */}
      <section className="section-base reveal-section" id="mission">
          <div className="container-lg">
              <div className="grid-2-1">
                  <div>
                      <h2 className="section-heading">Engineered for<br/><span className="text-crimson">Crisis Response</span></h2>
                      <p className="section-desc mt-6">
                          Conventional blood donation systems are slow. We disrupted the model with 
                          direct peer-to-peer connection algorithms that cut out the middleman 
                          when seconds matter.
                      </p>
                  </div>
                  <div className="process-list">
                      <div className="process-item">
                          <span className="process-num">01</span>
                          <div className="process-text">
                              <h4>Request</h4>
                              <p>Hospital verified entry triggers geo-fence.</p>
                          </div>
                      </div>
                      <div className="process-item">
                          <span className="process-num">02</span>
                          <div className="process-text">
                              <h4>Broadcast</h4>
                              <p>Compatible donors within 5km notified instantly.</p>
                          </div>
                      </div>
                      <div className="process-item">
                          <span className="process-num">03</span>
                          <div className="process-text">
                              <h4>Connect</h4>
                              <p>Secure handshake and navigation to patient.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* App Showcase */}
      <section className="app-showcase reveal-section" id="app">
          <div className="container-lg relative z-10">
              <div className="showcase-content">
                  <div className="label-caps mb-4">The Interface</div>
                  <h2 className="showcase-title">Control in Your<br/>Pocket</h2>
                  <p className="showcase-desc">
                      A minimal, dark-mode interface designed for high-stress environments. 
                      Track donations, manage health data, and respond to emergencies with 
                      a single tap.
                  </p>
                  
                  <div className="app-features-list">
                      <div className="af-item">
                          <svg className="w-5 h-5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>Biometric Login</span>
                      </div>
                      <div className="af-item">
                          <svg className="w-5 h-5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                          <span>Live Tracking</span>
                      </div>
                      <div className="af-item">
                          <svg className="w-5 h-5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>History Logs</span>
                      </div>
                  </div>
              </div>
              
              <div className="mockup-container">
                    {/* Abstract Phone Mockup */}
                    <div className="phone-frame">
                        <div className="phone-screen">
                            <div className="app-header">
                                <div className="app-time">9:41</div>
                                <div className="app-status">Active</div>
                            </div>
                            <div className="app-card alert-card">
                                <div className="ac-header">URGENT REQUEST</div>
                                <div className="ac-body">
                                    <div className="blood-drop">A+</div>
                                    <div className="ac-info">
                                        <div className="ac-dist">0.8 km away</div>
                                        <div className="ac-hos">City Hospital</div>
                                    </div>
                                </div>
                                <div className="ac-action">ACCEPT</div>
                            </div>
                            <div className="app-card stats-card">
                                <div className="sc-label">Your Impact</div>
                                <div className="sc-val">12 Lives</div>
                            </div>
                        </div>
                    </div>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section className="feature-section" id="impact">
        <div className="container-lg">
             <div className="grid-3">
                 <SpotlightCard className="feature-box" spotlightColor="rgba(220, 38, 38, 0.2)">
                     <div className="icon-box">01</div>
                     <h3>Precision Matching</h3>
                     <p>Algorithms filter donors by blood type, distance, and verified availability instantly, ensuring a 99% compatibility rate.</p>
                 </SpotlightCard>
                 
                 <SpotlightCard className="feature-box" spotlightColor="rgba(220, 38, 38, 0.2)">
                     <div className="icon-box">02</div>
                     <h3>Digital Verification</h3>
                     <p>Secure ID verification and blockchain-backed medical history checks ensure absolute safety for every transfusion.</p>
                 </SpotlightCard>
                 
                 <SpotlightCard className="feature-box" spotlightColor="rgba(220, 38, 38, 0.2)">
                     <div className="icon-box">03</div>
                     <h3>Rapid Logistics</h3>
                     <p>Coordination with local motorcycle fleets to expedite blood delivery in extreme gridlock traffic scenarios.</p>
                 </SpotlightCard>
             </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section reveal-section" id="faq">
          <div className="container-lg">
              <h2 className="section-heading text-center mb-16">System Info</h2>
              <div className="faq-grid">
                  {[
                      { q: "How is donor privacy protected?", a: "We use military-grade encryption for all personal data. Donors are only revealed to verified medical institutions once a request is accepted." },
                      { q: "Is the platform free to use?", a: "Yes. BloodReq is a non-profit initiative funded by grants and optional premium features for hospital networks." },
                      { q: "What verification is required?", a: "Donors must provide a government ID and a recent medical clearance certificate, which is verified by our admin team within 24 hours." },
                      { q: "Can hospitals integrate their API?", a: "Absolutely. We offer a robust REST API for hospital management systems to automate request broadcasting." }
                  ].map((item, i) => (
                      <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`} onClick={() => toggleFaq(i)}>
                          <div className="faq-question">
                              {item.q}
                              <span className="faq-toggle">+</span>
                          </div>
                          <div className="faq-answer">
                              <p>{item.a}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Big Number Impact */}
      <section className="impact-section reveal-section">
          <div className="impact-container">
              <div className="impact-number">12,400+</div>
              <div className="impact-label">LIVES SAVED IN 2025</div>
          </div>
      </section>

      {/* Footer */}
      <footer className="footer-minimal">
          <div className="footer-grid">
              <div className="brand-col">
                  <h4>BloodReq</h4>
                  <p>The vital link in the chain of survival.</p>
                  <div className="social-links mt-4 flex gap-4">
                      <a href="#" className="opacity-50 hover:opacity-100">TW</a>
                      <a href="#" className="opacity-50 hover:opacity-100">LI</a>
                      <a href="#" className="opacity-50 hover:opacity-100">IG</a>
                  </div>
              </div>
              <div className="link-col">
                  <div className="col-group">
                    <h5>Platform</h5>
                    <a href="#">Donors</a>
                    <a href="#">Hospitals</a>
                    <a href="#">API</a>
                  </div>
                  <div className="col-group">
                    <h5>Company</h5>
                    <a href="#">Mission</a>
                    <a href="#">Careers</a>
                    <a href="#">Press</a>
                  </div>
                  <div className="col-group">
                    <h5>Legal</h5>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                  </div>
              </div>
          </div>
          <div className="footer-bottom">
              © 2026 BloodReq Inc. All rights reserved. designed in Tokyo.
          </div>
      </footer>
    </div>
  );
}

