"use client";

import { motion } from 'framer-motion';
import { IconX, IconDownload, IconFileCheck } from '@tabler/icons-react';
import jsPDF from 'jspdf';

interface LoanApplication {
  loanAmount: number;
  tenure: number;
  interestRate: number;
  monthlyEMI: number;
  purpose: string;
}

interface Props {
  loanApplication: LoanApplication;
  userName: string;
  onClose: () => void;
}

export default function SanctionLetterModal({ loanApplication, userName, onClose }: Props) {
  
  const generatePDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-IN');
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TATA CAPITAL', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Lending Division', 105, 28, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LOAN SANCTION LETTER', 105, 45, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${today}`, 20, 55);
    doc.text(`Ref No: TC${Date.now().toString().slice(-8)}`, 20, 60);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dear ' + userName + ',', 20, 75);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const congratsText = 'We are pleased to inform you that your loan application has been approved by Tata Capital. The details of the sanctioned loan are as follows:';
    doc.text(congratsText, 20, 85, { maxWidth: 170 });
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 100, 170, 60, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.rect(20, 100, 170, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Details:', 25, 110);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Sanctioned Amount: ₹${loanApplication.loanAmount.toLocaleString('en-IN')}`, 25, 120);
    doc.text(`Tenure: ${loanApplication.tenure} months`, 25, 128);
    doc.text(`Interest Rate: ${loanApplication.interestRate}% per annum`, 25, 136);
    doc.text(`Monthly EMI: ₹${loanApplication.monthlyEMI.toLocaleString('en-IN')}`, 25, 144);
    doc.text(`Purpose: ${loanApplication.purpose}`, 25, 152);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, 175);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const terms = [
      '1. This sanction is valid for 30 days from the date of issue.',
      '2. Disbursement is subject to satisfactory completion of all documentation.',
      '3. Processing fee of 2% of the sanctioned amount is applicable.',
      '4. Pre-payment charges: 4% if prepaid within 12 months, 2% thereafter.',
      '5. Late payment charges of 2% per month will be levied on overdue EMIs.',
      '6. The loan is subject to terms and conditions as per the loan agreement.'
    ];
    
    let yPos = 183;
    terms.forEach(term => {
      doc.text(term, 20, yPos, { maxWidth: 170 });
      yPos += 7;
    });
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Authorized Signatory', 140, 250);
    doc.text('Tata Capital Limited', 140, 257);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated document and does not require a physical signature.', 105, 280, { align: 'center' });
    
    doc.save(`Tata_Capital_Sanction_Letter_${Date.now()}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full"
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <IconFileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Loan Approved</h2>
              <p className="text-sm text-neutral-400">Sanction Letter Ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <IconX className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
            >
              <IconFileCheck className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Congratulations, {userName}!</h3>
            <p className="text-neutral-400">Your loan has been sanctioned</p>
          </div>

          <div className="bg-neutral-800/50 rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-400">Sanctioned Amount</span>
              <span className="text-white font-bold">₹{loanApplication.loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Tenure</span>
              <span className="text-white font-bold">{loanApplication.tenure} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Interest Rate</span>
              <span className="text-white font-bold">{loanApplication.interestRate}% per annum</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Monthly EMI</span>
              <span className="text-white font-bold">₹{loanApplication.monthlyEMI.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generatePDF}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <IconDownload className="w-6 h-6" />
            Download Sanction Letter
          </motion.button>

          <p className="text-center text-neutral-500 text-xs mt-4">
            This sanction is valid for 30 days. Please proceed with documentation.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
