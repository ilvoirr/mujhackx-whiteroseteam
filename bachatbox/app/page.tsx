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

// Configure Libre Baskerville font
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

// ============================================================
//        REDIRECT LOGIC WHEN USER IS SIGNED IN (CLERK)
// ============================================================

// Component to handle redirect when user is already signed in
function RedirectToApp({ router }: { router: ReturnType<typeof useRouter> }) {
  // Redirect to app page immediately when component mounts
  useEffect(() => {
    router.push("/apppage");
  }, []);

  // Initialize particles.js after redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.onload = () => {
        window.particlesJS.load('particles-js', '/polygon-particles.json', () => {
          console.log('callback - particles.js config loaded');
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  return null;
}

// ============================================================
//                   MAIN HOMEPAGE COMPONENT
// ============================================================

export default function HomePage() {
  const router = useRouter();
  
  // State for dynamic navbar background color
  const [navbarBg, setNavbarBg] = useState('#1a1a1a');

  // Initialize particles.js on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.onload = () => {
        window.particlesJS.load('particles-js', '/polygon-particles.json', () => {
          console.log('callback - particles.js config loaded');
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  // Combined scroll event listener for navbar background AND scroll limit
  useEffect(() => {
    const handleScroll = () => {
      // Get viewport height in pixels
      const vh = window.innerHeight;
      
      // Calculate maximum scroll limit (480vh)
      const maxScrollLimit = vh * 3.87;
      
      // Enforce scroll limit - prevent scrolling beyond 480vh
      if (window.scrollY > maxScrollLimit) {
        window.scrollTo(0, maxScrollLimit);
        return; // Exit early if we hit the limit
      }
      
      // Navbar height is 6vh, convert to pixels
      const navbarHeightPx = (6 / 100) * vh;
      
      // Current scroll position
      const scrollY = window.scrollY;
      
      // Calculate navbar bottom position relative to document top
      const navbarBottom = scrollY + navbarHeightPx;
      
      // Change background color based on scroll position
      if (navbarBottom >= vh * 2) {
        // When navbar bottom touches 200vh
        setNavbarBg('#0a0a0a');
      } else if (navbarBottom >= vh * 1) {
        // When navbar bottom touches 100vh
        setNavbarBg('#121212');
      } else {
        // Default color
        setNavbarBg('#1a1a1a');
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Call once on mount to set initial color
    handleScroll();

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ============================================================
          REDIRECT IF USER IS ALREADY SIGNED IN
      ============================================================ */}
      <SignedIn>
        <RedirectToApp router={router} />
      </SignedIn>

      {/* ============================================================
          TOP NAVIGATION BAR - NOW FIXED WITH DYNAMIC BACKGROUND
      ============================================================ */}

      {/* Custom CSS for specific screen size styling */}
      <style>
        {`
          @media (min-width: 1300px) and (max-width: 1400px) {
            .only-1366 {
              font-size: 1.6vh;
            }
          }
          
          /* Smooth transition for navbar background color */
          .navbar-transition {
            transition: background-color 0.3s ease;
          }
        `}
      </style>

      {/* Navigation header with logo, title, and auth buttons - FIXED POSITION */}
      <div 
        className="navbar-transition fixed top-0 left-0 w-full flex items-center justify-between h-[6vh] text-white px-4 md:px-8 z-50"
        style={{ backgroundColor: navbarBg }}
      >
        {/* Left side: Logo and title */}
        <div className="flex items-center">
          {/* Logo/Icon SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-[#DAA520] w-[5vh] h-[5vh] md:w-[4.9vh] md:h-[4.9vh]"
            style={{ filter: 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.3))' }}
          >
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
          </svg>

          {/* App title - hidden on mobile */}
          <h1 className="hidden md:inline-flex text-[1.6vw] font-bold tracking-wider text-[#f5f5f5] ml-3" style={{ letterSpacing: '0.05em' }}>
            Tata Capital
          </h1>
        </div>

        {/* Right side: Authentication buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Show login/signup when user is signed out */}
          <SignedOut>
            <SignInButton>
              <Button className="only-1366 bg-transparent text-[#f5f5f5] border border-[#DAA520]/40 hover:text-[#1a1a1a] hover:bg-[#DAA520] hover:border-[#DAA520] md:text-[1.77vh] text-[4vw] px-3 md:px-4 transition-all duration-300">
                Login
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="only-1366 bg-[#DAA520] text-[#1a1a1a] hover:bg-[#C9A526] hover:text-[#0a0a0a] md:text-[1.77vh] text-[4vw] px-3 md:px-6 font-semibold transition-all duration-300">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
          
          {/* Show user button when signed in */}
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* ============================================================
          HERO SECTION WITH FARMVISION TEXT OVERLAY - ADJUSTED FOR FIXED NAVBAR
      ============================================================ */}
      {/* Main hero container with page1.png background */}
      <div 
        className="w-screen h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: 'url(/page1.png)',
        }}
      >
        
      </div>

      {/* Image sections */}
      <div className='w-screen h-screen'>
        <img 
          src="/page2.png" 
          alt="Page 2" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className='w-screen h-screen'>
        <img 
          src="/page3.png" 
          alt="Page 3" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className='w-screen h-screen'>
        <img 
          src="/page4.png" 
          alt="Page 4" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className='w-screen h-screen'>
        <img 
          src="/page5.png" 
          alt="Page 5" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* ============================================================
          FOOTER SPACER / BOTTOM GAP
      ============================================================ */}
    </div>
  );
}
