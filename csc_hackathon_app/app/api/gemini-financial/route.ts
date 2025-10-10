import Groq from "groq-sdk";
import { NextRequest, NextResponse } from 'next/server';
import { adviceCache, cosineSim, compactContext } from '@/lib/adviceCache';

interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseCategories: Record<string, number>;
  recentTransactions: string[];
  transactionCount: number;
}

interface RequestBody {
  message: string;
  language: 'en' | 'hi';
  financialData: FinancialData;
  userId: string;
}

// ============ DEBUGGING ============
console.log('==========================================');
console.log('CHATBOT API LOADED:');
console.log('GROQ_API_KEY exists?', !!process.env.GROQ_API_KEY);
console.log('==========================================');
// ============ END DEBUGGING ============

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  let languageFallback: 'en' | 'hi' = 'en';

  try {
    console.log('\n🔵 Chatbot request received');
    
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const body: RequestBody = await request.json();
    const { message, language, financialData, userId } = body;
    languageFallback = language;

    console.log('📊 Language:', language, '| Balance:', financialData.balance);

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Cache check
    const cacheKey = `${userId}_${message.toLowerCase().trim()}`;
    const exactMatch = adviceCache.get(cacheKey);
    if (exactMatch) {
      console.log('✅ Cache hit');
      return NextResponse.json({ message: exactMatch, cached: true });
    }

    // Fuzzy match
    for (const [cachedQ, cachedA] of adviceCache.entries()) {
      if (cosineSim(cachedQ.split('_')[1] || '', message) > 0.85) {
        console.log('✅ Similar cache hit');
        return NextResponse.json({ message: cachedA, cached: true });
      }
    }

    console.log('⚠️ No cache - calling Groq');

    const financialContext = compactContext(financialData);

    const getEmotional = (balance: number, lang: 'en' | 'hi') => {
      if (balance < -5000) return lang === 'hi' ? "मैं समझता हूं कि यह कठिन है। आप अकेले नहीं।" : "I understand this is tough. You're not alone.";
      if (balance > 10000) return lang === 'hi' ? "बढ़िया प्रगति!" : "Great progress!";
      return "";
    };

    const emotionalNote = getEmotional(financialData.balance, language);

    const systemPrompt = language === 'hi'
      ? `आप BudgetBot हैं - दयालु वित्तीय साथी।

स्थिति: ${financialContext}
${emotionalNote}

60-100 शब्दों में गर्म, व्यावहारिक सलाह दें।`
      
      : `You are BudgetBot - a caring financial companion.

Status: ${financialContext}
${emotionalNote}

Respond in 60-100 words with warmth and practical advice.`;

    const prompt = `${systemPrompt}\n\nUser: "${message}"\n\nRespond helpfully:`;

    console.log('🤖 Calling Groq...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 500,
    });

    let text = chatCompletion.choices[0]?.message?.content || '';
    console.log('✅ Response received');

    // Add emotional enhancers
    const enhancers = {
      hi: {
        positive: ["बहुत बढ़िया!", "शानदार!", "गर्व है!"],
        supportive: ["मैं साथ हूं", "हम करेंगे", "आप कर सकते हैं"]
      },
      en: {
        positive: ["Great job!", "Impressive!", "Well done!"],
        supportive: ["I'm here", "We've got this", "You can do it"]
      }
    };

    const e = enhancers[language];
    if (financialData.balance > 5000) {
      text += ` ${e.positive[Math.floor(Math.random() * e.positive.length)]}`;
    } else if (financialData.balance < -1000) {
      text = `${e.supportive[Math.floor(Math.random() * e.supportive.length)]}. ` + text;
    }

    adviceCache.set(cacheKey, text);
    console.log('✅ Cached\n');

    return NextResponse.json({
      message: text,
      cached: false,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ ERROR:', error);
    
    const errMsg = languageFallback === 'hi' 
      ? 'तकनीकी समस्या है। कृपया फिर कोशिश करें।'
      : 'Technical issue. Please try again.';

    return NextResponse.json({ message: errMsg, error: error.message }, { status: 500 });
  }
}
