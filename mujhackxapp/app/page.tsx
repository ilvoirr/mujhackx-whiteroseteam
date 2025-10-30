"use client";

// -------------------- Type Declarations --------------------
declare global {
  interface Window {
    particlesJS: any;
  }
}

// -------------------- Font and UI Imports --------------------
import { roboto } from './fonts';
import { Button } from "@/components/ui/button";
import { Libre_Baskerville } from 'next/font/google';

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

// -------------------- React and Routing --------------------
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';

// -------------------- Clerk Authentication Components --------------------
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

// -------------------- SVG Icon Components --------------------
const ArrowRightIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const ShieldCheckIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);

const ClockIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const StarIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

// Component to handle redirect when user is already signed in
function RedirectToApp({ router }: { router: ReturnType<typeof useRouter> }) {
  useEffect(() => {
    router.push("/apppage");
  }, [router]);
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const [navbarBg, setNavbarBg] = useState('transparent');

  // Initialize particles.js on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.onload = () => {
        if (document.getElementById('particles-js')) {
            window.particlesJS.load('particles-js', '/polygon-particles.json', () => {
              console.log('callback - particles.js config loaded');
            });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // SCROLL LOGIC for navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavbarBg('#111111');
      } else {
        setNavbarBg('transparent');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FADE-IN ANIMATION LOGIC for sections
  useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('is-visible');
              }
          });
      }, { threshold: 0.1 });

      const elements = document.querySelectorAll('.fade-in-section');
      elements.forEach(el => observer.observe(el));

      return () => elements.forEach(el => observer.unobserve(el));
  }, []);

  return (
    <div className={`overflow-x-hidden bg-[#0a0a0a] text-gray-200 ${roboto.className}`}>
      <SignedIn>
        <RedirectToApp router={router} />
      </SignedIn>

      <style>
        {`
          .navbar-transition {
            transition: background-color 0.4s ease-out;
          }
          .gold-text-glow {
            color: #DAA520;
            text-shadow: 0 0 10px rgba(218, 165, 32, 0.5);
          }
          .hero-gradient {
            background: radial-gradient(circle at 50% 50%, rgba(10, 10, 10, 0.2) 0%, rgba(10, 10, 10, 0.9) 80%, #0a0a0a 100%);
          }
          .fade-in-section {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          }
          .fade-in-section.is-visible {
            opacity: 1;
            transform: translateY(0px);
          }
          .trust-badge {
            background: rgba(218, 165, 32, 0.1);
            border: 1px solid rgba(218, 165, 32, 0.3);
            transition: all 0.3s ease;
          }
          .trust-badge:hover {
            background: rgba(218, 165, 32, 0.15);
            border-color: rgba(218, 165, 32, 0.5);
          }
        `}
      </style>

      {/* ============================================================
          TOP NAVIGATION BAR WITH ADDITIONAL MENU ITEMS
      ============================================================ */}
      <div 
        className="navbar-transition fixed top-0 left-0 w-full flex items-center justify-between h-[8vh] text-white px-6 md:px-12 z-50"
        style={{ backgroundColor: navbarBg }}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-[#DAA520] w-[5vh] h-[5vh]"
            style={{ filter: 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.3))' }}
          >
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
          </svg>
          <h1 className="hidden md:inline-flex text-xl font-bold tracking-wider text-[#f5f5f5] ml-4">
            EY Capital
          </h1>
        </div>
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          <a href="#features" className="hover:text-[#DAA520] transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-[#DAA520] transition-colors">Reviews</a>
          <a href="#security" className="hover:text-[#DAA520] transition-colors">Security</a>
          <a href="#faq" className="hover:text-[#DAA520] transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white px-5 py-2 transition-all duration-300">
                Login
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="bg-[#DAA520] text-[#1a1a1a] hover:bg-[#C9A526] px-5 py-2 font-semibold transition-all duration-300 transform hover:scale-105">
                Sign Up Free
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      
      <main>
        {/* ============================================================
            SLIDE 1: HERO WITH TRUST INDICATORS
        ============================================================ */}
        <section className="w-screen h-screen relative flex flex-col items-center justify-center text-center p-4">
            <div id="particles-js" className="absolute top-0 left-0 w-full h-full z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full hero-gradient z-10"></div>
            <div className="z-20 max-w-5xl">
                <h1 className={`${libreBaskerville.className} text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6`}>
                    Intelligent Lending. <br /> <span className="gold-text-glow">Instantly.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                    Get personalized loans from ₹50,000 to ₹25 Lakhs with instant approval. Powered by conversational AI technology from EY Capital.
                </p>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-[#DAA520]" />
                    <span>RBI Registered NBFC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-[#DAA520]" />
                    <span>5-Minute Approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-[#DAA520]" />
                    <span>4.8/5 Rating (12,500+ Reviews)</span>
                  </div>
                </div>

                <SignedOut>
                  <SignUpButton>
                    <Button size="lg" className="bg-[#DAA520] text-[#1a1a1a] hover:bg-[#C9A526] text-lg px-10 py-7 font-bold transition-all duration-300 transform hover:scale-105 group">
                        Check Eligibility in 30 Seconds <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </SignUpButton>
                  <p className="mt-4 text-sm text-gray-500">No impact on credit score • 100% paperless</p>
                </SignedOut>
            </div>
        </section>

        {/* ============================================================
            STATS SECTION - SOCIAL PROOF
        ============================================================ */}
        <section className="w-full py-16 bg-[#0d0d0d] border-y border-gray-800 fade-in-section">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold gold-text-glow mb-2`}>₹5000Cr+</div>
                        <p className="text-gray-400 text-sm">Total Loans Disbursed</p>
                    </div>
                    <div>
                        <div className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold gold-text-glow mb-2`}>2.5L+</div>
                        <p className="text-gray-400 text-sm">Happy Customers</p>
                    </div>
                    <div>
                        <div className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold gold-text-glow mb-2`}>5 Min</div>
                        <p className="text-gray-400 text-sm">Average Approval Time</p>
                    </div>
                    <div>
                        <div className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold gold-text-glow mb-2`}>98.7%</div>
                        <p className="text-gray-400 text-sm">Customer Satisfaction</p>
                    </div>
                </div>
            </div>
        </section>

        {/* ============================================================
            SLIDE 2: THE SHIFT - ENHANCED WITH BENEFITS
        ============================================================ */}
        <section className="min-h-screen w-full flex items-center justify-center py-20 px-6 fade-in-section">
            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="md:pr-10">
                    <h2 className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold leading-tight mb-6`}>
                        From <span className="text-gray-500 line-through">Paperwork</span><br />To <span className="gold-text-glow">Personalization</span>.
                    </h2>
                    <p className="mt-6 text-lg text-gray-400 mb-8">
                        Traditional loan applications are slow, impersonal, and complex. We reimagined the entire process as a single, intelligent conversation. Our Master AI Agent doesn't just process data—it understands your needs, negotiates terms, and orchestrates a team of specialized AIs to secure your approval in minutes, not days.
                    </p>
                    
                    {/* Key Benefits */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 w-6 h-6 rounded-full bg-[#DAA520]/20 flex items-center justify-center flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-[#DAA520]"></div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Zero Physical Documentation</h4>
                                <p className="text-sm text-gray-400">Complete the entire process from your phone. No printing, scanning, or courier required.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 w-6 h-6 rounded-full bg-[#DAA520]/20 flex items-center justify-center flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-[#DAA520]"></div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Personalized Interest Rates</h4>
                                <p className="text-sm text-gray-400">Our AI analyzes your profile to offer you the best possible rates starting at 10.99% p.a.*</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 w-6 h-6 rounded-full bg-[#DAA520]/20 flex items-center justify-center flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-[#DAA520]"></div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Instant Disbursal</h4>
                                <p className="text-sm text-gray-400">Funds transferred directly to your bank account within 30 minutes of approval.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center p-8">
                     <svg className="w-full max-w-md h-auto text-gray-700" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 20C144.183 20 180 55.8172 180 100C180 144.183 144.183 180 100 180C55.8172 180 20 144.183 20 100C20 55.8172 55.8172 20 100 20Z" stroke="url(#paint0_linear_105_2)" strokeWidth="2"/>
                        <path d="M100 40C133.137 40 160 66.8629 160 100C160 133.137 133.137 160 100 160C66.8629 160 40 133.137 40 100C40 66.8629 66.8629 40 100 40Z" stroke="url(#paint1_linear_105_2)" strokeWidth="2" strokeDasharray="4 4"/>
                        <circle cx="100" cy="100" r="10" fill="#DAA520"/>
                        <defs>
                        <linearGradient id="paint0_linear_105_2" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse"><stop stopColor="#DAA520"/><stop offset="1" stopColor="#DAA520" stopOpacity="0"/></linearGradient>
                        <linearGradient id="paint1_linear_105_2" x1="100" y1="40" x2="100" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="#f5f5f5" stopOpacity="0.5"/><stop offset="1" stopColor="#f5f5f5" stopOpacity="0"/></linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </section>

        {/* ============================================================
            SLIDE 3: HOW IT WORKS - WITH FEATURES ID
        ============================================================ */}
        <section id="features" className="min-h-screen w-full flex items-center justify-center py-20 px-6 bg-[#111111] fade-in-section">
            <div className="container mx-auto text-center">
                <h2 className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold mb-4`}>The Symphony of <span className="gold-text-glow">Agentic AI</span></h2>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-16">
                    One Master Agent acts as your personal conductor, seamlessly coordinating specialist AI agents to perform every task with precision and speed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    <div className="border-t-2 border-[#DAA520]/50 pt-6">
                        <div className="w-12 h-12 rounded-full bg-[#DAA520]/20 flex items-center justify-center mx-auto mb-4">
                            <span className={`${libreBaskerville.className} text-2xl font-bold text-[#DAA520]`}>1</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Sales Agent</h3>
                        <p className="text-gray-400">Understands your requirements and negotiates your ideal loan amount, tenure (12-60 months), and competitive interest rates through natural conversation.</p>
                    </div>
                     <div className="border-t-2 border-gray-700 pt-6">
                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                            <span className={`${libreBaskerville.className} text-2xl font-bold text-white`}>2</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Verification Agent</h3>
                        <p className="text-gray-400">Instantly validates your Aadhaar, PAN, and banking details against CKYC and secure government databases with 256-bit encryption.</p>
                    </div>
                     <div className="border-t-2 border-gray-700 pt-6">
                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                            <span className={`${libreBaskerville.className} text-2xl font-bold text-white`}>3</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Underwriting Agent</h3>
                        <p className="text-gray-400">Analyzes credit bureau data (CIBIL, Experian, Equifax) and income statements to provide an instant eligibility decision with transparent criteria.</p>
                    </div>
                     <div className="border-t-2 border-gray-700 pt-6">
                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                            <span className={`${libreBaskerville.className} text-2xl font-bold text-white`}>4</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Sanction Generator</h3>
                        <p className="text-gray-400">Automatically creates and delivers your official digitally-signed PDF sanction letter upon approval, ready for immediate fund transfer.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* ============================================================
            TESTIMONIALS SECTION - SOCIAL PROOF
        ============================================================ */}
        <section id="testimonials" className="min-h-screen w-full flex items-center justify-center py-20 px-6 fade-in-section">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold mb-4`}>Trusted by <span className="gold-text-glow">Thousands</span></h2>
                    <p className="text-lg text-gray-400">Real stories from real customers who transformed their financial journey</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Testimonial 1 */}
                    <div className="bg-[#111111] p-8 rounded-lg border border-gray-800 hover:border-[#DAA520]/50 transition-all">
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="w-5 h-5 text-[#DAA520]" />
                            ))}
                        </div>
                        <p className="text-gray-300 mb-6 italic">
                            "I got ₹5 lakhs approved in just 4 minutes! The AI conversation was so natural, it felt like talking to a helpful friend. No hassle, no paperwork, just instant approval."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DAA520] to-[#C9A526] flex items-center justify-center text-white font-bold">
                                RP
                            </div>
                            <div>
                                <p className="font-semibold text-white">Rahul Patel</p>
                                <p className="text-sm text-gray-500">Mumbai, Maharashtra</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-[#111111] p-8 rounded-lg border border-gray-800 hover:border-[#DAA520]/50 transition-all">
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="w-5 h-5 text-[#DAA520]" />
                            ))}
                        </div>
                        <p className="text-gray-300 mb-6 italic">
                            "As a small business owner, I needed funds urgently. EY Capital's AI system understood my needs perfectly and got me ₹10 lakhs with better rates than my bank offered."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DAA520] to-[#C9A526] flex items-center justify-center text-white font-bold">
                                SK
                            </div>
                            <div>
                                <p className="font-semibold text-white">Sneha Kulkarni</p>
                                <p className="text-sm text-gray-500">Pune, Maharashtra</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="bg-[#111111] p-8 rounded-lg border border-gray-800 hover:border-[#DAA520]/50 transition-all">
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="w-5 h-5 text-[#DAA520]" />
                            ))}
                        </div>
                        <p className="text-gray-300 mb-6 italic">
                            "Completely paperless! I applied from my phone during lunch break and had the money in my account before dinner. This is the future of banking."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DAA520] to-[#C9A526] flex items-center justify-center text-white font-bold">
                                AM
                            </div>
                            <div>
                                <p className="font-semibold text-white">Arjun Mehta</p>
                                <p className="text-sm text-gray-500">Bangalore, Karnataka</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
                    <div className="trust-badge px-6 py-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-1">Rated on</p>
                        <p className="font-bold text-white">Trustpilot</p>
                        <div className="flex gap-1 mt-2 justify-center">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="w-4 h-4 text-[#DAA520]" />
                            ))}
                        </div>
                    </div>
                    <div className="trust-badge px-6 py-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-1">Rated on</p>
                        <p className="font-bold text-white">Google Play</p>
                        <p className="text-[#DAA520] font-bold mt-2">4.7/5</p>
                    </div>
                    <div className="trust-badge px-6 py-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-1">Featured in</p>
                        <p className="font-bold text-white">Economic Times</p>
                    </div>
                </div>
            </div>
        </section>

        {/* ============================================================
            SECURITY & COMPLIANCE SECTION
        ============================================================ */}
        <section id="security" className="w-full py-20 px-6 bg-[#111111] fade-in-section">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold mb-4`}>
                        Bank-Grade <span className="gold-text-glow">Security</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Your data is protected with military-grade encryption and regulatory compliance
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="text-center">
                        <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-[#DAA520]" />
                        <h3 className="font-bold text-white mb-2">RBI Registered</h3>
                        <p className="text-sm text-gray-400">Licensed Non-Banking Financial Company (NBFC)</p>
                    </div>
                    <div className="text-center">
                        <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-[#DAA520]" />
                        <h3 className="font-bold text-white mb-2">256-Bit SSL</h3>
                        <p className="text-sm text-gray-400">Bank-level encryption for all transactions</p>
                    </div>
                    <div className="text-center">
                        <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-[#DAA520]" />
                        <h3 className="font-bold text-white mb-2">ISO 27001</h3>
                        <p className="text-sm text-gray-400">Certified information security management</p>
                    </div>
                    <div className="text-center">
                        <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-[#DAA520]" />
                        <h3 className="font-bold text-white mb-2">PCI DSS</h3>
                        <p className="text-sm text-gray-400">Payment card industry data security standard</p>
                    </div>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-8 max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold text-white mb-4">Regulatory Compliance</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
                        <div className="flex items-start gap-2">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#DAA520] flex-shrink-0"></div>
                            <p>Reserve Bank of India (RBI) Licensed NBFC</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#DAA520] flex-shrink-0"></div>
                            <p>CKYC (Central Know Your Customer) Compliant</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#DAA520] flex-shrink-0"></div>
                            <p>Data Protection & Privacy Act Certified</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#DAA520] flex-shrink-0"></div>
                            <p>Fair Practice Code Adherent</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ============================================================
            FAQ SECTION
        ============================================================ */}
        <section id="faq" className="min-h-screen w-full flex items-center justify-center py-20 px-6 fade-in-section">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className={`${libreBaskerville.className} text-4xl md:text-5xl font-bold mb-4`}>
                        Frequently Asked <span className="gold-text-glow">Questions</span>
                    </h2>
                    <p className="text-lg text-gray-400">Everything you need to know about our AI-powered lending</p>
                </div>

                <div className="space-y-6">
                    <details className="group bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-[#DAA520]/50 transition-all">
                        <summary className="font-bold text-white cursor-pointer list-none flex items-center justify-between">
                            What loan amounts can I apply for?
                            <span className="text-[#DAA520] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-4 text-gray-400">
                            You can apply for personal loans ranging from ₹50,000 to ₹25,00,000, subject to eligibility. Our AI system will analyze your profile and recommend the optimal amount based on your income, credit history, and repayment capacity.
                        </p>
                    </details>

                    <details className="group bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-[#DAA520]/50 transition-all">
                        <summary className="font-bold text-white cursor-pointer list-none flex items-center justify-between">
                            How fast is the approval process?
                            <span className="text-[#DAA520] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-4 text-gray-400">
                            Most applications receive instant decisions within 5 minutes. Once approved, funds are typically disbursed to your bank account within 30 minutes to 24 hours, depending on your bank's processing time.
                        </p>
                    </details>

                    <details className="group bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-[#DAA520]/50 transition-all">
                        <summary className="font-bold text-white cursor-pointer list-none flex items-center justify-between">
                            What are the interest rates?
                            <span className="text-[#DAA520] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-4 text-gray-400">
                            Interest rates start from 10.99% p.a. and vary based on your credit profile, loan amount, and tenure. Our AI system ensures you get the most competitive rate for your specific situation. There are no hidden charges.
                        </p>
                    </details>

                    <details className="group bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-[#DAA520]/50 transition-all">
                        <summary className="font-bold text-white cursor-pointer list-none flex items-center justify-between">
                            What documents do I need?
                            <span className="text-[#DAA520] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-4 text-gray-400">
                            You'll need: (1) Aadhaar card for identity verification, (2) PAN card for tax purposes, (3) Latest 3 months' bank statements, and (4) Salary slips or ITR for income proof. All documents can be uploaded digitally through our secure platform.
                        </p>
                    </details>

                    <details className="group bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-[#DAA520]/50 transition-all">
                        <summary className="font-bold text-white cursor-pointer list-none flex items-center justify-between">
                            Will checking eligibility affect my credit score?
                            <span className="text-[#DAA520] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-4 text-gray-400">
                            No! Our eligibility check is a soft inquiry that does not impact your credit score. Only when you proceed to formal application and approval will a hard inquiry be recorded with the credit bureaus.
                        </p>
                    </details>

                    <details className="group bg-[#111111] border border-gray-800 rounded-lg p-6 hover:border-[#DAA520]/50 transition-all">
                        <summary className="font-bold text-white cursor-pointer list-none flex items-center justify-between">
                            Can I prepay my loan without penalties?
                            <span className="text-[#DAA520] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-4 text-gray-400">
                            Yes, you can prepay your loan partially or in full at any time. We charge zero prepayment penalties, giving you complete flexibility to manage your finances efficiently.
                        </p>
                    </details>
                </div>
            </div>
        </section>

        {/* ============================================================
            FINAL CTA WITH ENHANCED COPY
        ============================================================ */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center text-center py-20 px-6 fade-in-section">
             <div className="container mx-auto max-w-4xl">
                <h2 className={`${libreBaskerville.className} text-5xl md:text-6xl font-bold text-white mb-6`}>
                    Your Future, Funded.
                </h2>
                <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                    Step away from the complexity of traditional banking. Experience the simplicity, speed, and intelligence of the next generation of financial services. Join 2.5 lakh+ satisfied customers who chose smarter lending.
                </p>
                <SignedOut>
                  <SignUpButton>
                    <Button size="lg" className="bg-[#DAA520] text-[#1a1a1a] hover:bg-[#C9A526] text-lg px-10 py-7 font-bold transition-all duration-300 transform hover:scale-105 group mb-4">
                        Get Your Instant Approval <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </SignUpButton>
                  <p className="text-sm text-gray-500">⚡ 5-minute approval • 💳 No credit score impact • 📱 100% digital</p>
                </SignedOut>

                {/* Contact Options */}
                <div className="mt-16 pt-16 border-t border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-6">Need Help? We're Here 24/7</h3>
                    <div className="flex flex-wrap justify-center gap-6 text-gray-400">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#DAA520]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>1800-266-7766 (Toll Free)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#DAA520]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>support@EYcapital.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#DAA520]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Live Chat Available</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* ============================================================
            ENHANCED FOOTER WITH LEGAL LINKS
        ============================================================ */}
        <footer className="bg-[#0a0a0a] text-gray-500 border-t border-gray-800">
            <div className="container mx-auto px-6 py-12">
                {/* Footer Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="text-white font-bold mb-4">Products</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Personal Loans</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Business Loans</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Home Loans</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Loan Calculator</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Press & Media</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Blog</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">How It Works</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">EMI Calculator</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Fair Practice Code</a></li>
                            <li><a href="#" className="hover:text-[#DAA520] transition-colors">Grievance Redressal</a></li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="border-t border-gray-800 pt-8 text-xs text-gray-600 space-y-2">
                    <p>
                        <strong>Disclaimer:</strong> This is a technology demonstration project exploring Agentic AI applications in financial services. EY Capital is a trademark of EY Sons Private Limited. This project is not affiliated with, endorsed by, or sponsored by EY Capital Limited or any EY Group company.
                    </p>
                    <p>
                        *Interest rates, processing fees, and loan terms are subject to eligibility and credit approval. All loans are subject to RBI guidelines and company policies. Actual rates may vary based on individual credit profile, loan amount, and tenure.
                    </p>
                    <p>
                        **Instant approval is subject to successful verification of documents and credit assessment. Disbursal timelines depend on bank processing times and may vary.
                    </p>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} EY Capital AI Lending Platform. All Rights Reserved.</p>
                    <p className="mt-2 text-xs">CIN: [Company Identification Number] | NBFC Registration: [Registration Number]</p>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}
