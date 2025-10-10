"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import {
  IconMessageCircle,
  IconChartBar,
  IconReceipt,
  IconTable,
  IconBook,
  IconTrendingUp,
  IconSend,
  IconTrashX,
  IconShieldCheck,
  IconX,
  IconCheck,
  IconDownload
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'agent';
  agent?: string;
};

type LoanData = {
  amount: number;
  tenure: number;
  rate: number;
  emi: number;
  purpose: string;
};

const Logo = () => (
  <div className="relative z-20 flex items-center space-x-2 py-1">
    <div className="text-white w-[4vh] h-[4vh] md:w-[3vh] md:h-[3vh] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
      </svg>
    </div>
    <span className="text-[1.4vw] font-semibold text-white">Tata Capital</span>
  </div>
);

const LogoIcon = () => (
  <div className="relative z-20 flex items-center space-x-2 py-1">
    <div className="text-white w-[4vh] h-[4vh] md:w-[3vh] md:h-[3vh] flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
      </svg>
    </div>
  </div>
);

export default function LoanAgentPage() {
  const { user } = useUser();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stage, setStage] = useState('sales');
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  
  // KYC Modal
  const [showKYC, setShowKYC] = useState(false);
  const [kycName, setKycName] = useState('');
  const [kycPhone, setKycPhone] = useState('');
  const [kycAadhaar, setKycAadhaar] = useState('');
  const [kycPan, setKycPan] = useState('');
  
  // Sanction Modal
  const [showSanction, setShowSanction] = useState(false);

  const links = [
    { label: "Balance Sheet", href: "/apppage", icon: <IconReceipt className="h-7 w-7 text-white" />, onClick: () => router.push('/apppage') },
    { label: "Visualise Stats", href: "/visualise", icon: <IconChartBar className="h-7 w-7 text-white" />, onClick: () => router.push('/visualise') },
    { label: "Tata BFSI Dashboard", href: "/advice", icon: <IconTable className="h-7 w-7 text-white" />, onClick: () => router.push('/advice') },
    { label: "Tata Loans Expert", href: "/chatbot", icon: <IconMessageCircle className="h-7 w-7 text-white" />, onClick: () => router.push('/chatbot') },
    { label: "Financial Reads", href: "/financial-reads", icon: <IconBook className="h-7 w-7 text-white" />, onClick: () => router.push('/financial-reads') },
    { label: "Stock Market", href: "/investment", icon: <IconTrendingUp className="h-7 w-7 text-white" />, onClick: () => router.push('/investment') },
  ];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        text: "Welcome to Tata Capital. I'm your loan specialist. Tell me what loan you need - amount, purpose, and tenure.",
        sender: 'agent',
        agent: '💼 Sales Agent'
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractLoan = (text: string) => {
    const lower = text.toLowerCase();
    let amount = 0;
    let tenure = 60;
    let purpose = 'Personal';

    const amountMatch = lower.match(/(\d+)\s*(lakh|lac|l)/i);
    if (amountMatch) amount = parseInt(amountMatch[1]) * 100000;

    const tenureMatch = lower.match(/(\d+)\s*(year|yr)/i);
    if (tenureMatch) tenure = parseInt(tenureMatch[1]) * 12;

    if (lower.includes('home') || lower.includes('house')) purpose = 'Home Loan';
    else if (lower.includes('car') || lower.includes('vehicle')) purpose = 'Vehicle Loan';
    else if (lower.includes('business')) purpose = 'Business Loan';
    else if (lower.includes('education')) purpose = 'Education Loan';

    return { amount, tenure, purpose };
  };

  const calculateEMI = (p: number, r: number, n: number) => {
    const monthly = r / 12 / 100;
    return Math.round((p * monthly * Math.pow(1 + monthly, n)) / (Math.pow(1 + monthly, n) - 1));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      const { amount, tenure, purpose } = extractLoan(userInput);
      
      if (stage === 'sales' && amount > 0) {
        const rate = 10.5;
        const emi = calculateEMI(amount, rate, tenure);
        setLoanData({ amount, tenure, rate, emi, purpose });

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: `Perfect! Here's your loan proposal:\n\n💰 Amount: ₹${amount.toLocaleString()}\n📅 Tenure: ${tenure} months\n📊 Rate: ${rate}% p.a.\n💳 EMI: ₹${emi.toLocaleString()}\n🎯 Purpose: ${purpose}\n\nShall we proceed with KYC verification? (Type "yes" to continue)`,
            sender: 'agent',
            agent: '💼 Sales Agent'
          }]);
          setLoading(false);
        }, 1000);
      } else if (stage === 'sales' && userInput.toLowerCase().includes('yes')) {
        setStage('kyc');
        setShowKYC(true);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Great! Opening KYC verification form...",
          sender: 'agent',
          agent: '🔐 Verification Agent'
        }]);
        setLoading(false);
      } else {
        // Default AI response
        const res = await fetch('/api/loan-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userInput })
        });
        const data = await res.json();
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message || "I can help you with loans. Please specify the amount and purpose.",
          sender: 'agent',
          agent: '💼 Sales Agent'
        }]);
        setLoading(false);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Error connecting. Please try again.",
        sender: 'agent'
      }]);
      setLoading(false);
    }
  };

  const handleKYCSubmit = () => {
    setShowKYC(false);
    setStage('underwriting');
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: "KYC verified successfully! Processing your credit check...",
      sender: 'agent',
      agent: '📊 Underwriting Agent'
    }]);

    setTimeout(() => {
      const approved = kycAadhaar.length === 12 && kycPan.length === 10;
      
      if (approved) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `🎉 Congratulations! Your loan is APPROVED!\n\nApproved Amount: ₹${loanData?.amount.toLocaleString()}\nTenure: ${loanData?.tenure} months\nRate: ${loanData?.rate}% p.a.\nMonthly EMI: ₹${loanData?.emi.toLocaleString()}\n\nGenerating sanction letter...`,
          sender: 'agent',
          agent: '📊 Underwriting Agent'
        }]);
        setTimeout(() => setShowSanction(true), 1500);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Unfortunately, your application is under review. Our team will contact you within 48 hours.",
          sender: 'agent',
          agent: '📊 Underwriting Agent'
        }]);
      }
    }, 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('TATA CAPITAL', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('LOAN SANCTION LETTER', 105, 35, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Dear ${user?.fullName || kycName},`, 20, 55);
    doc.text('Your loan has been approved with following terms:', 20, 65);
    doc.text(`Amount: ₹${loanData?.amount.toLocaleString()}`, 20, 80);
    doc.text(`Tenure: ${loanData?.tenure} months`, 20, 90);
    doc.text(`Rate: ${loanData?.rate}% p.a.`, 20, 100);
    doc.text(`EMI: ₹${loanData?.emi.toLocaleString()}`, 20, 110);
    doc.text(`Purpose: ${loanData?.purpose}`, 20, 120);
    doc.text('Valid for 30 days from date of issue.', 20, 140);
    doc.save('Tata_Sanction_Letter.pdf');
  };

  return (
    <>
      <SignedIn>
        <div className="bg-black min-h-screen flex">
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-screen z-30">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className="justify-between gap-10 bg-[#1a1a1a] h-full">
                <div className="flex flex-1 flex-col overflow-y-auto">
                  <div onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)}>
                    {sidebarOpen ? <Logo /> : <LogoIcon />}
                  </div>
                  <div className="mt-8 flex flex-col gap-2">
                    {links.map((link, i) => (
                      <div key={i} onClick={link.onClick} className="cursor-pointer">
                        <SidebarLink link={link} />
                      </div>
                    ))}
                  </div>
                </div>
                <SidebarLink link={{
                  label: user?.username || 'User',
                  href: "#",
                  icon: <div className="h-7 w-7 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">
                    {(user?.username?.[0] || 'U').toUpperCase()}
                  </div>
                }} />
              </SidebarBody>
            </Sidebar>
          </div>

          {/* Main Content */}
          <div className={cn("flex-1 transition-all", sidebarOpen ? "ml-64" : "ml-30")}>
            {/* Topbar */}
            <div className="sticky top-0 z-20 h-[9.5vh] bg-gradient-to-r from-black via-neutral-900 to-black px-8 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  {stage === 'sales' && 'Sales Agent'}
                  {stage === 'kyc' && 'KYC Verification'}
                  {stage === 'underwriting' && 'Credit Analysis'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => {
                  setMessages([]);
                  setStage('sales');
                  setLoanData(null);
                }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium">
                  <IconTrashX className="w-4 h-4" />
                  New Chat
                </button>
                <div className="flex items-center gap-3 px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-700" onClick={() => triggerRef.current?.querySelector('button')?.click()}>
                  <span className="text-white text-sm">{user?.username || user?.firstName}</span>
                  <div ref={triggerRef}><UserButton afterSignOutUrl="/" /></div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="h-[calc(100vh-9.5vh)] flex flex-col bg-black">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white' 
                          : 'bg-neutral-900 text-neutral-200 border border-neutral-800'
                      }`}>
                        {msg.agent && <div className="text-xs text-gray-400 mb-1">{msg.agent}</div>}
                        <div className="whitespace-pre-line">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Box */}
              <div className="border-t border-neutral-800 p-6">
                <div className="max-w-4xl mx-auto flex items-center gap-4 bg-neutral-900 rounded-2xl border border-neutral-800 px-6 py-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none"
                  />
                  <button onClick={handleSend} disabled={loading} className="p-3 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl disabled:opacity-50">
                    <IconSend className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Modal */}
          {showKYC && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowKYC(false)}>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <IconShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">KYC Verification</h2>
                  </div>
                  <button onClick={() => setShowKYC(false)} className="text-neutral-400 hover:text-white">
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={kycName} onChange={(e) => setKycName(e.target.value)} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none" />
                  <input type="tel" placeholder="Phone Number" value={kycPhone} onChange={(e) => setKycPhone(e.target.value)} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="Aadhaar (12 digits)" value={kycAadhaar} onChange={(e) => setKycAadhaar(e.target.value)} maxLength={12} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none" />
                  <input type="text" placeholder="PAN (10 chars)" value={kycPan} onChange={(e) => setKycPan(e.target.value.toUpperCase())} maxLength={10} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none" />
                </div>

                <button onClick={handleKYCSubmit} disabled={!kycName || !kycAadhaar || !kycPan} className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  <IconCheck className="w-5 h-5" />
                  Submit KYC
                </button>
              </div>
            </div>
          )}

          {/* Sanction Modal */}
          {showSanction && loanData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowSanction(false)}>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <IconCheck className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Loan Approved!</h3>
                  <p className="text-neutral-400">Congratulations {user?.firstName || kycName}</p>
                </div>

                <div className="bg-neutral-800/50 rounded-xl p-6 mb-6 space-y-3 text-white">
                  <div className="flex justify-between"><span className="text-neutral-400">Amount</span><span className="font-bold">₹{loanData.amount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Tenure</span><span className="font-bold">{loanData.tenure} months</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Rate</span><span className="font-bold">{loanData.rate}% p.a.</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">EMI</span><span className="font-bold">₹{loanData.emi.toLocaleString()}</span></div>
                </div>

                <button onClick={generatePDF} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-3">
                  <IconDownload className="w-6 h-6" />
                  Download Sanction Letter
                </button>
              </div>
            </div>
          )}
        </div>
      </SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
