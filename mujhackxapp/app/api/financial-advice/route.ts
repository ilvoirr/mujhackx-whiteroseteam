import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

console.log('==========================================');
console.log('LOAN CREDIBILITY API LOADED:');
console.log('GROQ_API_KEY exists?', !!process.env.GROQ_API_KEY);
console.log('==========================================');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  console.log('\n🔵 POST request received at /api/financial-advice');
  
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY is NOT defined');
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    console.log('✅ GROQ_API_KEY found');

    const { transactions, budget } = await req.json();
    console.log('📊 Request data received:');
    console.log('  - Transactions count:', transactions?.length || 0);
    console.log('  - Budget:', budget || 'Not set');

    if (!transactions || transactions.length === 0) {
      console.log('⚠️ No transactions provided');
      return NextResponse.json({
        advice: {
          healthScore: 0,
          healthStatus: "No data yet",
          topSpending: "Add transactions to see your loan eligibility profile",
          savingsOpportunity: "Show us your financial behavior to unlock better loan rates",
          monthlyTrend: "Need transaction history to assess loan credibility",
          budgetStatus: "Build credit history by tracking your finances",
          recommendations: ["Add income and expenses to check loan eligibility"],
          insights: ["Lenders want to see stable income patterns"],
          goals: ["Track finances for 3 months to improve loan chances"]
        }
      });
    }

    // Calculate financial data
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
    
    const expensesByCategory = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((acc: any, t: any) => {
        const category = t.description || 'Other';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {});

    const sortedExpenses = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number));

    const topSpendingCategory = sortedExpenses[0] as [string, number] | undefined;
    const topCategory = topSpendingCategory?.[0] || 'expenses';
    const topAmount = topSpendingCategory?.[1] || 0;

    const expenseTransactions = transactions.filter((t: any) => t.type === 'expense');
    const avgExpenseAmount = expenseTransactions.length > 0 
      ? totalExpenses / expenseTransactions.length 
      : 0;

    // Calculate loan-specific metrics
    const monthlyIncome = totalIncome; // Assuming this is monthly data
    const monthlyExpenses = totalExpenses;
    const disposableIncome = balance;
    const debtToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    const maxLoanEligibility = disposableIncome * 12 * 5; // Rough 5x annual savings
    const recommendedEMI = disposableIncome * 0.4; // 40% of disposable income

    const loanPrompt = `You are Tata Capital's loan advisor analyzing someone's finances for loan eligibility and creditworthiness.

FINANCIAL PROFILE:
- Monthly Income: ₹${totalIncome.toLocaleString('en-IN')}
- Monthly Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
- Disposable Income: ₹${disposableIncome.toLocaleString('en-IN')}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Debt-to-Income Ratio: ${debtToIncomeRatio.toFixed(1)}%
- Top Spending: ${topCategory} - ₹${topAmount.toLocaleString('en-IN')}
- Transaction History: ${transactions.length} transactions

LOAN ELIGIBILITY INDICATORS:
- Estimated Max Loan: ₹${maxLoanEligibility.toLocaleString('en-IN')}
- Recommended Max EMI: ₹${recommendedEMI.toLocaleString('en-IN')}

Respond ONLY with valid JSON:
{
  "healthScore": [0-100 credit score based on financial behavior],
  "healthStatus": "[Credit rating: Excellent/Good/Fair/Poor]",
  "topSpending": "[Observation about spending that affects loan eligibility]",
  "savingsOpportunity": "[How to improve loan profile with specific numbers]",
  "monthlyTrend": "[Income stability and spending pattern assessment]",
  "budgetStatus": "[Debt-to-income analysis and what it means for loans]",
  "recommendations": ["[3 specific actions to improve loan eligibility with numbers]"],
  "insights": ["[2-3 observations about creditworthiness and loan readiness]"],
  "goals": ["[4 goals to improve credit profile and loan terms]"]
}

Focus on:
- Loan types they qualify for (personal, home, auto, business)
- How to improve credit score
- Ways to reduce debt-to-income ratio
- Building better financial history
- Specific EMI they can afford
- What lenders look for

Be specific, use their actual numbers. No markdown, just pure JSON.`;

    console.log('🤖 Calling Groq API...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: loanPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    console.log('✅ Groq API call successful');
    
    const adviceText = chatCompletion.choices[0]?.message?.content || '';
    console.log('📝 Response length:', adviceText.length);

    let parsedAdvice;
    try {
      parsedAdvice = JSON.parse(adviceText);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parsing failed, using fallback');
      
      // Fallback with loan-focused advice
      const creditScore = savingsRate > 30 ? 85 : savingsRate > 15 ? 70 : savingsRate > 5 ? 55 : 40;
      const loanEligible = maxLoanEligibility > 0 ? maxLoanEligibility : totalIncome * 12;
      
      parsedAdvice = {
        healthScore: Math.min(Math.max(creditScore, 10), 95),
        healthStatus: creditScore >= 75 ? "Excellent Credit" : creditScore >= 60 ? "Good Credit" : creditScore >= 45 ? "Fair Credit" : "Needs Improvement",
        topSpending: `${topCategory} spending (₹${topAmount.toLocaleString('en-IN')}) is ${((topAmount/totalExpenses)*100).toFixed(0)}% of expenses - lenders prefer <30% on discretionary`,
        savingsOpportunity: `Increase savings to ${Math.min(savingsRate + 10, 35).toFixed(0)}% = qualify for ₹${Math.round(loanEligible * 1.3).toLocaleString('en-IN')} loans instead of ₹${loanEligible.toLocaleString('en-IN')}`,
        monthlyTrend: `Income: ₹${totalIncome.toLocaleString('en-IN')}, Expenses: ₹${totalExpenses.toLocaleString('en-IN')} - Debt-to-income ratio: ${debtToIncomeRatio.toFixed(1)}% (lenders prefer <43%)`,
        budgetStatus: debtToIncomeRatio < 43 
          ? `Debt-to-income: ${debtToIncomeRatio.toFixed(1)}% ✓ You qualify for most loans!` 
          : `Debt-to-income: ${debtToIncomeRatio.toFixed(1)}% - reduce to below 43% to improve approval odds`,
        recommendations: [
          `You can afford EMI up to ₹${recommendedEMI.toLocaleString('en-IN')}/month (40% of surplus)`,
          `Eligible for loans: Personal (₹${Math.round(disposableIncome * 24).toLocaleString('en-IN')}), Home (₹${Math.round(disposableIncome * 60).toLocaleString('en-IN')})`,
          `Reduce ${topCategory} by 20% to improve debt-to-income ratio by ${(debtToIncomeRatio * 0.2).toFixed(1)}%`
        ],
        insights: [
          `${savingsRate.toFixed(0)}% savings rate ${savingsRate >= 20 ? 'shows strong repayment capacity' : 'needs improvement for better rates'}`,
          `₹${disposableIncome.toLocaleString('en-IN')} monthly surplus = can service ₹${Math.round(disposableIncome * 0.4 * 60).toLocaleString('en-IN')} loan @ 9% for 5 years`,
          `${transactions.length} transactions tracked - lenders prefer 6+ months of clean financial history`
        ],
        goals: [
          `Maintain debt-to-income below 40% (currently ${debtToIncomeRatio.toFixed(0)}%)`,
          `Build 6-month expense reserve: ₹${(totalExpenses * 6).toLocaleString('en-IN')}`,
          `Increase savings rate to ${Math.min(savingsRate + 15, 35).toFixed(0)}% to unlock premium loan rates`,
          `Track finances for 6 months to show consistent income - improves approval by 40%`
        ]
      };
    }

    console.log('🎉 Returning loan advice\n');
    return NextResponse.json({ advice: parsedAdvice });

  } catch (error: any) {
    console.error('❌ ERROR:', error);
    return NextResponse.json(
      { error: `Failed: ${error.message}` },
      { status: 500 }
    );
  }
}
