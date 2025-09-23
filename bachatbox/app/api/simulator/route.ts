import { analyzeSpendingPatterns, generateFunnyScenarios, getSpendingPersonality, generateAchievements } from '@/utils/simulator';

interface RequestBody {
  transactions: Array<{
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date?: string;
    description?: string;
    timestamp?: Date;
  }>;
}

export async function POST(request: Request) {
  try {
    const data: RequestBody = await request.json();
    const transactions = data.transactions || [];
    
    // Analyze patterns locally in JavaScript  
    const analysis = analyzeSpendingPatterns(transactions);
    const scenarios = generateFunnyScenarios(analysis);
    const personality = getSpendingPersonality(analysis);
    const achievements = generateAchievements(transactions);
    
    return Response.json({
      scenarios,
      personality,
      achievements
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return Response.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
