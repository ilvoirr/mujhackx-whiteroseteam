"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconUpload, IconCheck, IconShieldCheck } from '@tabler/icons-react';

interface KYCData {
  fullName: string;
  phone: string;
  email: string;
  aadhaar: string;
  pan: string;
  address: string;
  addressProof?: File;
  incomeProof?: File;
}

interface Props {
  onClose: () => void;
  onComplete: (data: KYCData) => void | Promise<void>;
}

export default function KYCVerificationModal({ onClose, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [kycData, setKycData] = useState<KYCData>({
    fullName: '',
    phone: '',
    email: '',
    aadhaar: '',
    pan: '',
    address: ''
  });

  const handleFileUpload = (field: 'addressProof' | 'incomeProof', file: File) => {
    setKycData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsVerifying(false);
    await Promise.resolve(onComplete(kycData));
  };

  return (
    <AnimatePresence>
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
          className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <IconShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">KYC Verification</h2>
                <p className="text-sm text-neutral-400">Step {step} of 2</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <IconX className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          <div className="px-6 pt-4">
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 2) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={kycData.fullName}
                    onChange={(e) => setKycData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="As per Aadhaar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={kycData.phone}
                      onChange={(e) => setKycData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={kycData.email}
                      onChange={(e) => setKycData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      value={kycData.aadhaar}
                      onChange={(e) => setKycData(prev => ({ ...prev, aadhaar: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="XXXX XXXX XXXX"
                      maxLength={12}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={kycData.pan}
                      onChange={(e) => setKycData(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="XXXXX0000X"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Residential Address
                  </label>
                  <textarea
                    value={kycData.address}
                    onChange={(e) => setKycData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Complete address with pincode"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Address Proof
                  </label>
                  <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="addressProof"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('addressProof', e.target.files[0])}
                    />
                    <label htmlFor="addressProof" className="cursor-pointer">
                      <IconUpload className="w-12 h-12 mx-auto mb-3 text-neutral-500" />
                      <p className="text-neutral-400 text-sm">
                        {kycData.addressProof ? kycData.addressProof.name : 'Upload Aadhaar / Utility Bill'}
                      </p>
                      {kycData.addressProof && (
                        <p className="text-green-500 text-xs mt-2">File uploaded successfully</p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Income Proof
                  </label>
                  <div className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="incomeProof"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('incomeProof', e.target.files[0])}
                    />
                    <label htmlFor="incomeProof" className="cursor-pointer">
                      <IconUpload className="w-12 h-12 mx-auto mb-3 text-neutral-500" />
                      <p className="text-neutral-400 text-sm">
                        {kycData.incomeProof ? kycData.incomeProof.name : 'Upload Salary Slip / ITR'}
                      </p>
                      {kycData.incomeProof && (
                        <p className="text-green-500 text-xs mt-2">File uploaded successfully</p>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    All documents will be verified against government databases and credit bureaus for your security.
                  </p>
                </div>
              </div>
            )}

            {isVerifying && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-neutral-900 rounded-2xl p-8 text-center border border-neutral-800 shadow-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white font-medium">Verifying your details...</p>
                  <p className="text-neutral-400 text-sm mt-2">This may take a few moments</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-6 border-t border-neutral-800">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
              >
                Back
              </button>
            )}
            <div className="flex-1" />
            {step < 2 ? (
              <button
                onClick={() => setStep(2)}
                disabled={!kycData.fullName || !kycData.phone || !kycData.aadhaar || !kycData.pan}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!kycData.addressProof || !kycData.incomeProof || isVerifying}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <IconCheck className="w-5 h-5" />
                Complete Verification
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
