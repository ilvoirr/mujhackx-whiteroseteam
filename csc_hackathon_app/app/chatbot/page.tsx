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
  IconDownload,
  IconAlertCircle
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

// DUMMY CRM DATABASE
const CRM_DATABASE = [
  {
    name: 'Varun',
    phone: '1234512345',
    pan: '1234512345',
    aadhaar: '123412341234',
    creditScore: 750,
    existingCustomer: true,
    riskProfile: 'Low',
  }
];

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
  
  // CRM Verification State
  const [crmVerified, setCrmVerified] = useState(false);
  const [customerData, setCustomerData] = useState<typeof CRM_DATABASE[0] | null>(null);

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
        text: `Hello! I'm Raj from Tata Capital. ${user?.firstName ? `Nice to meet you, ${user.firstName}.` : 'Great to connect with you.'} How can I assist you with your financial goals today?`,
        sender: 'agent',
        agent: 'Sales Agent'
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

  // CRM Verification Function
  const verifyCRMData = (name: string, phone: string, aadhaar: string, pan: string) => {
    const customer = CRM_DATABASE.find(
      (record) =>
        record.name.toLowerCase() === name.toLowerCase() &&
        record.phone === phone &&
        record.aadhaar === aadhaar &&
        record.pan === pan
    );

    return customer || null;
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
            text: `Excellent. Let me prepare that proposal for you:\n\nLoan Amount: ₹${amount.toLocaleString()}\nTenure: ${tenure} months (${tenure/12} years)\nInterest Rate: ${rate}% per annum\nMonthly EMI: ₹${emi.toLocaleString()}\nPurpose: ${purpose}\n\nThese terms look favorable for your requirements. Would you like to proceed with the application? I will need to collect some documents for KYC verification.`,
            sender: 'agent',
            agent: 'Sales Agent'
          }]);
          setLoading(false);
        }, 1000);
        return;
      }

      const res = await fetch('/api/loan-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          conversationHistory: messages,
          stage: stage
        })
      });
      
      const data = await res.json();
      
      if (data.shouldTransition && stage === 'sales') {
        setStage('kyc');
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message,
          sender: 'agent',
          agent: 'Sales Agent'
        }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "Perfect. Let me initiate your KYC verification process. I am opening the secure verification form now.",
            sender: 'agent',
            agent: 'Verification Agent'
          }]);
          setTimeout(() => setShowKYC(true), 800);
        }, 1500);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message || "I am here to assist you with your loan requirements. What would you like to know?",
          sender: 'agent',
          agent: stage === 'sales' ? 'Sales Agent' : 'Verification Agent'
        }]);
      }
      
      setLoading(false);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I apologize for the technical issue. Please let me assist you - could you tell me what loan you are interested in?",
        sender: 'agent',
        agent: 'Sales Agent'
      }]);
      setLoading(false);
    }
  };

  const handleKYCSubmit = () => {
    setShowKYC(false);
    setStage('underwriting');
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `Thank you, ${kycName}. Initiating KYC verification process.`,
      sender: 'agent',
      agent: 'Verification Agent'
    }]);

    // Step 1: Document Verification
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Step 1 of 3: Verifying submitted documents.\n\nPAN Card: Validated\nAadhaar Card: Validated\nPhone Number: Verified",
        sender: 'agent',
        agent: 'Verification Agent'
      }]);
    }, 1000);

    // Step 2: CRM Database Check
    setTimeout(() => {
      const verifiedCustomer = verifyCRMData(kycName, kycPhone, kycAadhaar, kycPan);
      
      if (verifiedCustomer) {
        setCrmVerified(true);
        setCustomerData(verifiedCustomer);
        
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `Step 2 of 3: CRM Database Verification\n\nStatus: Customer Found\n\nProfile Details:\nName: ${verifiedCustomer.name}\nCustomer Type: ${verifiedCustomer.existingCustomer ? 'Existing Customer' : 'New Customer'}\nCredit Score: ${verifiedCustomer.creditScore}\nRisk Profile: ${verifiedCustomer.riskProfile}\n\nProceeding to credit analysis.`,
          sender: 'agent',
          agent: 'Verification Agent'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Step 2 of 3: CRM Database Verification\n\nStatus: Customer not found in existing CRM database.\n\nInitiating new customer onboarding and external credit bureau verification.",
          sender: 'agent',
          agent: 'Verification Agent'
        }]);
      }
    }, 3000);

    // Step 3: Credit Analysis & Final Decision
    setTimeout(() => {
      const verifiedCustomer = verifyCRMData(kycName, kycPhone, kycAadhaar, kycPan);
      const basicValidation = kycAadhaar.length === 12 && kycPan.length === 10;
      
      if (verifiedCustomer && basicValidation) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `Step 3 of 3: Credit Analysis and Underwriting\n\nCIBIL Score: ${verifiedCustomer.creditScore}\nRisk Assessment: ${verifiedCustomer.riskProfile} Risk\nDebt-to-Income Ratio: Healthy\nPayment History: Excellent\n\nAll verification checks have been successfully completed.\n\nYour loan application has been APPROVED.`,
          sender: 'agent',
          agent: 'Underwriting Agent'
        }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: `Congratulations, ${kycName}!\n\nYour loan has been approved with the following terms:\n\nApproved Amount: ₹${loanData?.amount.toLocaleString()}\nTenure: ${loanData?.tenure} months\nInterest Rate: ${loanData?.rate}% per annum\nMonthly EMI: ₹${loanData?.emi.toLocaleString()}\n\nGenerating your official sanction letter now.`,
            sender: 'agent',
            agent: 'Underwriting Agent'
          }]);
          setTimeout(() => setShowSanction(true), 1500);
        }, 2000);
        
      } else if (basicValidation && !verifiedCustomer) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Step 3 of 3: Credit Analysis and Underwriting\n\nAs a new customer, your application requires additional verification by our senior underwriting team.\n\nOur team will contact you within 24-48 hours with the next steps.\n\nThank you for choosing Tata Capital.",
          sender: 'agent',
          agent: 'Underwriting Agent'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Step 3 of 3: Credit Analysis and Underwriting\n\nDocument validation has failed. Please ensure all details are correct.\n\nKindly contact our customer support at 1800-209-8282 for assistance.",
          sender: 'agent',
          agent: 'Underwriting Agent'
        }]);
      }
    }, 5500);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPos = 20;

    const addNewPage = () => {
      doc.addPage();
      yPos = 20;
    };

    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        addNewPage();
      }
    };

    // PAGE 1 - HEADER & MAIN DETAILS
    doc.setFillColor(106, 13, 173);
    doc.rect(margin, yPos, 40, 15, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('TATA', margin + 20, yPos + 10, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TATA CAPITAL LIMITED', pageWidth / 2, yPos + 10, { align: 'center' });
    
    yPos += 20;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('CIN: L65910MH1991PLC060670', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Registered Office: 11th Floor, Tower A, Peninsula Business Park, Ganpatrao Kadam Marg,', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Lower Parel, Mumbai - 400013 | Tel: 022-6141-8282 | www.tatacapital.com', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.text(`Ref No: TC/SL/${Date.now().toString().slice(-8)}`, margin, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 40, yPos);
    
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.text('To,', margin, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(user?.fullName || kycName, margin, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`PAN: ${kycPan}`, margin, yPos);
    yPos += 7;
    doc.text(`Aadhaar: XXXX-XXXX-${kycAadhaar.slice(-4)}`, margin, yPos);
    
    if (crmVerified && customerData) {
      yPos += 7;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(0, 128, 0);
      doc.text(`[CRM Verified Customer | Credit Score: ${customerData.creditScore} | Risk: ${customerData.riskProfile}]`, margin, yPos);
      doc.setTextColor(0, 0, 0);
    }
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Subject: Sanction of Loan Facility', margin, yPos);
    
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Dear ${user?.firstName || kycName.split(' ')[0]},`, margin, yPos);
    
    yPos += 10;
    const openingText = `We are pleased to inform you that Tata Capital Limited ("the Company") has sanctioned a ${loanData?.purpose} in your favor, subject to the terms and conditions mentioned herein and as per your loan application dated ${new Date().toLocaleDateString('en-IN')}.`;
    
    const splitOpening = doc.splitTextToSize(openingText, pageWidth - 2 * margin);
    doc.text(splitOpening, margin, yPos);
    yPos += splitOpening.length * 6;

    yPos += 8;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 75, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 75);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SANCTIONED LOAN DETAILS', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const loanDetails = [
      ['Loan Amount Sanctioned:', `Rs. ${loanData?.amount.toLocaleString('en-IN')} (Rupees ${numberToWords(loanData?.amount || 0)} Only)`],
      ['Purpose of Loan:', loanData?.purpose || 'Personal'],
      ['Rate of Interest:', `${loanData?.rate}% per annum (Fixed)`],
      ['Loan Tenure:', `${loanData?.tenure} months (${Math.floor((loanData?.tenure || 0) / 12)} years ${(loanData?.tenure || 0) % 12} months)`],
      ['EMI Amount:', `Rs. ${loanData?.emi.toLocaleString('en-IN')} per month`],
      ['Processing Fee:', `Rs. ${Math.round((loanData?.amount || 0) * 0.02).toLocaleString('en-IN')} (2% of loan amount + GST)`],
    ];
    
    loanDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      const valueLines = doc.splitTextToSize(value, 100);
      doc.text(valueLines, margin + 65, yPos);
      yPos += Math.max(7, valueLines.length * 6);
    });

    yPos += 5;
    const totalAmount = (loanData?.emi || 0) * (loanData?.tenure || 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Payable:', margin + 5, yPos);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, margin + 65, yPos);

    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + 30);
    doc.text(`Note: This sanction is valid until ${validityDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, margin, yPos);

    // PAGE 2 - TERMS & CONDITIONS
    addNewPage();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TERMS AND CONDITIONS', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const termsAndConditions = [
      {
        title: '1. Disbursement',
        content: 'The loan amount shall be disbursed to your registered bank account within 3-5 working days upon submission of all required documents and fulfillment of pre-disbursement conditions.'
      },
      {
        title: '2. Repayment',
        content: `The loan shall be repayable in ${loanData?.tenure} Equated Monthly Installments (EMIs) of Rs. ${loanData?.emi.toLocaleString('en-IN')} each. The first EMI shall be due on the 5th day of the month following the date of disbursement. EMIs shall be recovered through Electronic Clearing Service (ECS) / NACH from your designated bank account.`
      },
      {
        title: '3. Interest Calculation',
        content: `Interest shall be calculated on a daily reducing balance basis at the rate of ${loanData?.rate}% per annum. In case of any change in RBI guidelines or market conditions, the Company reserves the right to revise the interest rate after giving you prior notice.`
      },
      {
        title: '4. Prepayment and Foreclosure',
        content: 'You may prepay the loan in full or in part at any time during the loan tenure. Prepayment charges of 4% + GST on the outstanding principal amount shall be applicable if foreclosure is done within 12 months from the date of disbursement. After 12 months, foreclosure is allowed without any charges.'
      },
      {
        title: '5. Penal Charges',
        content: 'In case of default or delay in payment of EMI, penal interest @2% per month on the outstanding EMI amount shall be charged. Additionally, a bounce charge of Rs. 500 + GST shall be levied for each EMI dishonor.'
      },
      {
        title: '6. Documentation',
        content: 'You are required to submit the following documents within 7 days: (a) Signed loan agreement, (b) Post-dated cheques for all EMIs, (c) ECS/NACH mandate form, (d) KYC documents, and (e) Any other documents as specified by the Company.'
      },
      {
        title: '7. Insurance',
        content: 'It is mandatory to obtain loan protection insurance as per the Company policy. The insurance premium shall be borne by you and can be added to the loan amount or paid separately.'
      },
      {
        title: '8. Events of Default',
        content: 'The loan shall be recalled immediately if: (a) You fail to pay 3 consecutive EMIs, (b) You provide false information, (c) You are declared insolvent, (d) You violate any terms of this agreement.'
      },
    ];

    termsAndConditions.forEach((term) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.text(term.title, margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const contentLines = doc.splitTextToSize(term.content, pageWidth - 2 * margin);
      doc.text(contentLines, margin, yPos);
      yPos += contentLines.length * 5 + 5;
    });

    // PAGE 3 - ADDITIONAL CONDITIONS
    addNewPage();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ADDITIONAL CONDITIONS', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const additionalConditions = [
      {
        title: '9. Credit Bureau Reporting',
        content: 'Your credit history, including repayment track record, will be shared with Credit Information Companies (CIBIL, Experian, Equifax, CRIF High Mark) as per RBI guidelines.'
      },
      {
        title: '10. Set-Off Rights',
        content: 'The Company shall have the right to set-off any amounts due from you against any deposits or amounts held by the Company on your behalf.'
      },
      {
        title: '11. Governing Law',
        content: 'This agreement shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.'
      },
      {
        title: '12. Communication',
        content: 'All communications shall be sent to your registered address, email, or mobile number. You agree to inform the Company of any changes within 7 days.'
      },
    ];

    additionalConditions.forEach((term) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.text(term.title, margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const contentLines = doc.splitTextToSize(term.content, pageWidth - 2 * margin);
      doc.text(contentLines, margin, yPos);
      yPos += contentLines.length * 5 + 5;
    });

    yPos += 10;
    checkPageBreak(60);
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ACCEPTANCE', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const acceptanceText = `I, ${user?.fullName || kycName}, hereby confirm that I have read, understood, and agree to abide by all the terms and conditions mentioned in this sanction letter. I request Tata Capital Limited to disburse the sanctioned loan amount to my registered bank account.`;
    const acceptanceLines = doc.splitTextToSize(acceptanceText, pageWidth - 2 * margin);
    doc.text(acceptanceLines, margin, yPos);
    yPos += acceptanceLines.length * 5 + 15;

    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.text("Borrower's Signature: _______________", margin, yPos);
    doc.text('Date: _______________', pageWidth - margin - 60, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Name: ${user?.fullName || kycName}`, margin, yPos);
    
    yPos += 25;
    doc.setFont('helvetica', 'bold');
    doc.text('For Tata Capital Limited', pageWidth - margin - 60, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', pageWidth - margin - 60, yPos);

    yPos = pageHeight - 30;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a system-generated document and does not require a physical signature from Tata Capital Limited.', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('For queries, contact our customer care at 1800-209-8282 or email support@tatacapital.com', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Tata Capital Limited is a Non-Banking Financial Company (NBFC) registered with RBI', pageWidth / 2, yPos, { align: 'center' });

    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`Tata_Capital_Sanction_Letter_${kycName.replace(/\s/g, '_')}_${Date.now()}.pdf`);
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred ' + numberToWords(num % 100);
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand ' + numberToWords(num % 1000);
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh ' + numberToWords(num % 100000);
    return 'Amount Too Large';
  };

  return (
    <>
      <SignedIn>
        <div className="bg-black min-h-screen flex">
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

          <div className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "ml-[300px]" : "ml-[60px]"
          )}>
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
                  setCrmVerified(false);
                  setCustomerData(null);
                }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  <IconTrashX className="w-4 h-4" />
                  New Chat
                </button>
                <div className="flex items-center gap-3 px-4 py-2 bg-neutral-900 rounded-lg border border-neutral-700" onClick={() => triggerRef.current?.querySelector('button')?.click()}>
                  <span className="text-white text-sm">{user?.username || user?.firstName}</span>
                  <div ref={triggerRef}><UserButton afterSignOutUrl="/" /></div>
                </div>
              </div>
            </div>

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
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-neutral-800 p-6">
                <div className="max-w-4xl mx-auto flex items-center gap-4 bg-neutral-900 rounded-2xl border border-neutral-800 px-6 py-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none"
                    disabled={loading}
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={loading || !input.trim()} 
                    className="p-3 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-700 hover:to-yellow-700 transition-all"
                  >
                    <IconSend className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Modal */}
          {showKYC && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowKYC(false)}>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <IconShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">KYC Verification</h2>
                  </div>
                  <button onClick={() => setShowKYC(false)} className="text-neutral-400 hover:text-white transition-colors">
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <IconAlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-300">
                      <p className="font-semibold mb-1">Test with Varun&apos;s credentials:</p>
                      <p>Phone: 1234512345 | PAN: 1234512345 | Aadhaar: 123412341234</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={kycName} 
                    onChange={(e) => setKycName(e.target.value)} 
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none transition-colors" 
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={kycPhone} 
                    onChange={(e) => setKycPhone(e.target.value)} 
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none transition-colors" 
                  />
                  <input 
                    type="text" 
                    placeholder="Aadhaar (12 digits)" 
                    value={kycAadhaar} 
                    onChange={(e) => setKycAadhaar(e.target.value)} 
                    maxLength={12} 
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none transition-colors" 
                  />
                  <input 
                    type="text" 
                    placeholder="PAN (10 chars)" 
                    value={kycPan} 
                    onChange={(e) => setKycPan(e.target.value.toUpperCase())} 
                    maxLength={10} 
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 outline-none transition-colors" 
                  />
                </div>

                <button 
                  onClick={handleKYCSubmit} 
                  disabled={!kycName || !kycAadhaar || !kycPan} 
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                >
                  <IconCheck className="w-5 h-5" />
                  Submit KYC
                </button>
              </div>
            </div>
          )}

          {/* Sanction Modal */}
          {showSanction && loanData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowSanction(false)}>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <IconCheck className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Loan Approved</h3>
                  <p className="text-neutral-400">Congratulations, {user?.firstName || kycName}</p>
                  {crmVerified && (
                    <p className="text-xs text-green-400 mt-2">[CRM Verified Customer]</p>
                  )}
                </div>

                <div className="bg-neutral-800/50 rounded-xl p-6 mb-6 space-y-3 text-white">
                  <div className="flex justify-between"><span className="text-neutral-400">Amount</span><span className="font-bold">Rs. {loanData.amount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Tenure</span><span className="font-bold">{loanData.tenure} months</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Rate</span><span className="font-bold">{loanData.rate}% p.a.</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">EMI</span><span className="font-bold">Rs. {loanData.emi.toLocaleString()}</span></div>
                </div>

                <button 
                  onClick={generatePDF} 
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:from-green-600 hover:to-emerald-700 transition-all"
                >
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
