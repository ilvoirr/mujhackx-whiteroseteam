interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  description?: string;
  timestamp?: Date;
}

interface Analysis {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryBreakdown: { [key: string]: number };
  avgExpenseAmount: number;
  expenseCount: number;
  savingsRate: number;
  topCategory: string;
  topCategoryAmount: number;
  weekendSpending: number;
}

interface Scenario {
  title: string;
  description: string;
  probability: number;
  icon: string;
  color: string;
}

interface Personality {
  type: string;
  badge: string;
  description: string;
}

interface Achievement {
  title: string;
  icon: string;
  unlocked: boolean;
}

export function analyzeSpendingPatterns(transactions: Transaction[]): Analysis {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  
  // Category breakdown
  const categoryBreakdown: { [key: string]: number } = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Other';
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount;
  });
  
  const topCategory = Object.keys(categoryBreakdown).reduce((a, b) => 
    categoryBreakdown[a] > categoryBreakdown[b] ? a : b, 'Other');
  
  const topCategoryAmount = categoryBreakdown[topCategory] || 0;
  
  // Weekend spending analysis
  const weekendSpending = expenses
    .filter(t => t.timestamp && (new Date(t.timestamp).getDay() === 0 || new Date(t.timestamp).getDay() === 6))
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpenses,
    netBalance,
    categoryBreakdown,
    avgExpenseAmount: expenses.length > 0 ? totalExpenses / expenses.length : 0,
    expenseCount: expenses.length,
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    topCategory,
    topCategoryAmount,
    weekendSpending
  };
}

export function generateFunnyScenarios(analysis: Analysis): Scenario[] {
  const scenarios: Scenario[] = [];
  
  // What if you continue current spending pattern
  if (analysis.totalExpenses > 0) {
    const monthlyProjection = analysis.totalExpenses * 12;
    scenarios.push({
      title: "What If You Keep This Up?",
      description: `At your current pace, you'll spend ₹${monthlyProjection.toLocaleString()} this year! That's like buying a small car every year. Maybe time to pump the brakes?`,
      probability: 90,
      icon: "trending-up",
      color: "red"
    });
  }
  
  // What if you cut your top category by 50%
  if (analysis.topCategoryAmount > 0) {
    const savings = analysis.topCategoryAmount * 0.5;
    const yearlyEquivalent = savings * 12;
    scenarios.push({
      title: `What If You Halved Your ${analysis.topCategory} Spending?`,
      description: `Cut your ${analysis.topCategory} budget by 50% and save ₹${savings.toLocaleString()}/month = ₹${yearlyEquivalent.toLocaleString()}/year! That's enough for a dream vacation or investment portfolio.`,
      probability: 75,
      icon: "target",
      color: "green"
    });
  }
  
  // What if you invested your weekend spending
  if (analysis.weekendSpending > 0) {
    const monthlyWeekendSpend = analysis.weekendSpending;
    const investmentReturn = monthlyWeekendSpend * 12 * 1.12; // 12% annual return
    scenarios.push({
      title: "What If Weekend Fun Became Future Wealth?",
      description: `Your ₹${monthlyWeekendSpend.toLocaleString()}/month weekend splurges could become ₹${investmentReturn.toLocaleString()}/year if invested! Party today vs paradise tomorrow?`,
      probability: 65,
      icon: "coffee",
      color: "purple"
    });
  }
  
  // What if you saved just 10% more
  const currentSavings = Math.max(0, analysis.netBalance);
  const tenPercentMore = currentSavings * 1.1;
  const compoundGrowth = tenPercentMore * 12 * Math.pow(1.08, 10); // 8% for 10 years
  scenarios.push({
    title: "What If You Saved 10% More?",
    description: `Save just 10% more (₹${(tenPercentMore - currentSavings).toLocaleString()}/month) and in 10 years you'll have ₹${compoundGrowth.toLocaleString()}! That's compound magic working for you.`,
    probability: 80,
    icon: "savings",
    color: "blue"
  });
  
  // What if emergency scenario
  if (analysis.netBalance > 0) {
    const emergencyFund = analysis.totalExpenses * 6; // 6 months expenses
    const timeToSave = emergencyFund / analysis.netBalance;
    scenarios.push({
      title: "What If Life Throws You a Curveball?",
      description: `You need ₹${emergencyFund.toLocaleString()} for 6-month emergency fund. At current savings rate, you'll be prepared in ${Math.ceil(timeToSave)} months. Future-you will thank present-you!`,
      probability: 85,
      icon: "alert",
      color: "orange"
    });
  }
  
  // What if inflation hits your spending
  const inflationImpact = analysis.totalExpenses * 0.06; // 6% inflation
  scenarios.push({
    title: "What If Inflation Strikes?",
    description: `With 6% inflation, your ₹${analysis.totalExpenses.toLocaleString()}/month expenses become ₹${(analysis.totalExpenses + inflationImpact).toLocaleString()}/month. Start earning more or spending smarter!`,
    probability: 70,
    icon: "trending-up",
    color: "red"
  });
  
  return scenarios.slice(0, 6); // Return top 6 scenarios
}

export function getSpendingPersonality(analysis: Analysis): Personality {
  if (analysis.savingsRate > 30) {
    return {
      type: "The Future Planner",
      badge: "Champion",
      description: `What if I told you you're already winning? With ${analysis.savingsRate.toFixed(1)}% savings rate, you're building serious wealth! Keep this momentum going.`
    };
  } else if (analysis.savingsRate > 15) {
    return {
      type: "The Balanced Visionary", 
      badge: "Strategist",
      description: `What if you could have the best of both worlds? Your ${analysis.savingsRate.toFixed(1)}% savings rate shows you're living well AND saving smart! Perfect balance achieved.`
    };
  } else if (analysis.savingsRate > 0) {
    return {
      type: "The Rising Star",
      badge: "Builder",
      description: `What if small steps led to big dreams? Your ${analysis.savingsRate.toFixed(1)}% savings is the seed of future wealth. Every rupee counts in your journey.`
    };
  } else {
    return {
      type: "The Experience Collector",
      badge: "Explorer",
      description: "What if memories were the best investment? You're living for today! But maybe save just ₹100/month? Future-you will send thank-you notes!"
    };
  }
}

export function generateAchievements(transactions: Transaction[]): Achievement[] {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categories = new Set(expenses.map(t => t.category));
  
  return [
    {
      title: "What-If Explorer",
      icon: "target",
      unlocked: transactions.length >= 5
    },
    {
      title: "Possibility Thinker", 
      icon: "trending-up",
      unlocked: transactions.some(t => t.type === 'income')
    },
    {
      title: "Scenario Master",
      icon: "chart", 
      unlocked: categories.size >= 3
    },
    {
      title: "Future Visionary",
      icon: "award",
      unlocked: transactions.length >= 15
    },
    {
      title: "What-If Wizard",
      icon: "sparkles",
      unlocked: true
    }
  ];
}
