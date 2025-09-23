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
  const [navbarBg, setNavbarBg] = useState('#f0fce4');

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
        setNavbarBg('#ffffff');
      } else if (navbarBottom >= vh * 1) {
        // When navbar bottom touches 100vh
        setNavbarBg('#ffffff');
      } else {
        // Default color
        setNavbarBg('#f0fce4');
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
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#48837e] w-[5vh] h-[5vh] md:w-[4.9vh] md:h-[4.9vh]"
          >
            <path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/>
            <path d="M16 10h.01"/>
            <path d="M2 8v1a2 2 0 0 0 2 2h1"/>
          </svg>

          {/* App title - hidden on mobile */}
          <h1 className="hidden md:inline-flex text-[1.6vw] font-semibold tracking-tight text-[#48837e] ml-3">
            BachatBox
          </h1>
        </div>

        {/* Right side: Authentication buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Show login/signup when user is signed out */}
          <SignedOut>
            <SignInButton>
              <Button className="only-1366 bg-transparent text-[#48837e] hover:text-white hover:bg-[#48837e] md:text-[1.77vh] text-[4vw] px-3 md:px-4">
                Login
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button className="only-1366 bg-white text-[#48837e] hover:bg-[#48837e] hover:text-white md:text-[1.77vh] text-[4vw] px-3 md:px-6">
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
