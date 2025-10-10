// app/api/sms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

type ParsedTransaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
  timestamp: Date;
  source: 'sms';
  bankName?: string;
};

function parseSMSMessage(message: string): ParsedTransaction | null {
  try {
    // Patterns for different SMS formats
    const patterns = [
      // SBI UPI pattern: "Dear UPI user A/C X5196 debited by 101.0 on date 13Sep25 trf to ARUTCHUDAR S Refno 525683147313"
      /(?:debited|credited)\s+by\s+(\d+(?:\.\d{1,2})?)/i,
      // General patterns for other banks
      /(?:Rs\.?\s*|INR\s*|₹\s*)(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
      // Amount with decimal
      /(\d+\.\d{1,2})/
    ];

    let amount = 0;
    let transactionType: 'income' | 'expense' = 'expense';
    let description = '';
    let bankName = '';

    // Extract amount
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    if (amount === 0) {
      console.log('Could not extract amount from SMS:', message);
      return null;
    }

    // Determine transaction type
    if (message.toLowerCase().includes('credited') || 
        message.toLowerCase().includes('received') ||
        message.toLowerCase().includes('deposit')) {
      transactionType = 'income';
    } else if (message.toLowerCase().includes('debited') ||
               message.toLowerCase().includes('paid') ||
               message.toLowerCase().includes('withdrawn')) {
      transactionType = 'expense';
    }

    // Extract bank name
    if (message.includes('-SBI')) bankName = 'SBI';
    else if (message.includes('HDFC')) bankName = 'HDFC';
    else if (message.includes('ICICI')) bankName = 'ICICI';
    else if (message.includes('AXIS')) bankName = 'Axis';
    else bankName = 'Bank';

    // Extract merchant/recipient name for description
    const transferPatterns = [
      /trf to ([^R]+?)(?:\s+Ref|$)/i,
      /paid to ([^R]+?)(?:\s+Ref|$)/i,
      /from ([^R]+?)(?:\s+Ref|$)/i
    ];

    for (const pattern of transferPatterns) {
      const match = message.match(pattern);
      if (match) {
        description = match[1].trim();
        break;
      }
    }

    if (!description) {
      description = transactionType === 'income' ? 'Money Received' : 'Payment Made';
    }

    // Determine category
    let category = 'Other';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('zomato') || lowerMessage.includes('swiggy')) {
      category = 'Food';
    } else if (lowerMessage.includes('fuel') || lowerMessage.includes('petrol') || lowerMessage.includes('diesel')) {
      category = 'Transport';
    } else if (lowerMessage.includes('grocery') || lowerMessage.includes('supermarket')) {
      category = 'Groceries';
    } else if (lowerMessage.includes('medicine') || lowerMessage.includes('pharmacy')) {
      category = 'Healthcare';
    } else if (transactionType === 'income') {
      category = 'Income';
    } else {
      category = 'Payment';
    }

    return {
      id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: transactionType,
      description: `${description} (${bankName})`,
      category,
      timestamp: new Date(),
      source: 'sms',
      bankName
    };
  } catch (error) {
    console.error('Error parsing SMS:', error);
    return null;
  }
}

// In-memory storage for SMS transactions (you can later move this to a database)
const smsTransactions: Map<string, ParsedTransaction[]> = new Map();

export async function GET(request: NextRequest) {
  try {
    // Use currentUser() instead of auth() for GET requests
    const user = await currentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userTransactions = smsTransactions.get(user.id) || [];
    
    console.log(`🔍 GET request - User ID: ${user.id}, Transactions: ${userTransactions.length}`);
    
    return NextResponse.json({
      success: true,
      transactions: userTransactions,
      count: userTransactions.length
    });
  } catch (error) {
    console.error('Error fetching SMS transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, parsed } = body;

    let parsedTransaction: ParsedTransaction | null = null;

    // Handle pre-parsed transaction data
    if (parsed) {
      console.log('📱 Received pre-parsed transaction for user:', user.id);
      console.log('📱 Parsed data:', parsed);

      parsedTransaction = {
        id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: parsed.amount,
        type: parsed.type,
        description: parsed.description,
        category: parsed.category || 'Other',
        timestamp: new Date(),
        source: 'sms',
        bankName: parsed.bankName || 'Bank'
      };
    }
    // Handle SMS message parsing
    else if (message) {
      console.log('📱 Received SMS message for user:', user.id);
      console.log('📱 Message:', message);

      parsedTransaction = parseSMSMessage(message);
    }
    else {
      return NextResponse.json({ 
        error: 'Either message or parsed transaction data is required' 
      }, { status: 400 });
    }

    if (!parsedTransaction) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not process transaction data' 
      }, { status: 400 });
    }

    // Store for the authenticated user
    const userTransactions = smsTransactions.get(user.id) || [];
    userTransactions.unshift(parsedTransaction);
    smsTransactions.set(user.id, userTransactions);

    console.log('✅ Stored transaction:', parsedTransaction);
    console.log(`📊 Total transactions for ${user.id}:`, userTransactions.length);

    return NextResponse.json({
      success: true,
      transaction: parsedTransaction,
      message: 'Transaction added successfully',
      totalTransactions: userTransactions.length
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Webhook endpoint for receiving SMS from external services
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, parsed } = body;

    // For webhook, we'll use a demo user if no userId provided
    // In production, you'd map phone numbers to user IDs
    const targetUserId = userId || 'demo_user_webhook';

    let parsedTransaction: ParsedTransaction | null = null;

    // Handle pre-parsed transaction data
    if (parsed) {
      console.log('🎣 Webhook received pre-parsed transaction for user:', targetUserId);
      console.log('🎣 Parsed data:', parsed);

      parsedTransaction = {
        id: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: parsed.amount,
        type: parsed.type,
        description: parsed.description,
        category: parsed.category || 'Other',
        timestamp: new Date(),
        source: 'sms',
        bankName: parsed.bankName || 'Bank'
      };
    }
    // Handle SMS message parsing
    else if (message) {
      console.log('🎣 Webhook received SMS message for user:', targetUserId);
      console.log('🎣 Message:', message);

      parsedTransaction = parseSMSMessage(message);
    }
    else {
      return NextResponse.json({ 
        error: 'Either message or parsed transaction data is required' 
      }, { status: 400 });
    }

    if (!parsedTransaction) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not process transaction data' 
      }, { status: 400 });
    }

    // Store transaction
    const userTransactions = smsTransactions.get(targetUserId) || [];
    userTransactions.unshift(parsedTransaction);
    smsTransactions.set(targetUserId, userTransactions);

    console.log('✅ Webhook processed transaction:', parsedTransaction);
    console.log(`📊 Total transactions for ${targetUserId}:`, userTransactions.length);

    return NextResponse.json({
      success: true,
      transaction: parsedTransaction,
      message: 'Transaction processed via webhook successfully',
      totalTransactions: userTransactions.length
    });
  } catch (error) {
    console.error('Error processing webhook transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
