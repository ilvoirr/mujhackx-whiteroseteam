import { NextRequest, NextResponse } from 'next/server';

interface LoanApplication {
  loanAmount: number;
  tenure: number;
  interestRate: number;
  monthlyEMI: number;
  purpose: string;
}

interface KYCData {
  fullName: string;
  phone: string;
  email: string;
  aadhaar: string;
  pan: string;
  address: string;
}

interface RequestBody {
  userId: string;
  loanApplication: LoanApplication;
  kycData: KYCData;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { loanApplication, kycData } = body;

    // Simple approval logic (replace with real credit check)
    const isApproved = 
      loanApplication.loanAmount <= 5000000 && 
      kycData.aadhaar.length === 12 && 
      kycData.pan.length === 10;

    if (isApproved) {
      return NextResponse.json({ 
        approved: true 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        approved: false,
        reason: "Credit criteria not met. Please improve credit score and reapply."
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Underwriting error:', error);
    return NextResponse.json({ 
      approved: false,
      reason: "System error during underwriting process"
    }, { status: 500 });
  }
}
