import { LRUCache } from 'lru-cache';

// Simple in-memory cache for RAG retrieval
export const adviceCache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60 * 12, // 12 hours
});

// Basic cosine similarity for string matching (simple RAG retrieval)
export function cosineSim(a: string, b: string): number {
  const vecA = a.toLowerCase().split(/\W+/).filter(Boolean);
  const vecB = b.toLowerCase().split(/\W+/).filter(Boolean);
  const setA = new Set(vecA);
  const setB = new Set(vecB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  return intersection.size / Math.sqrt(setA.size * setB.size);
}

// Compact financial data context to reduce token usage
export function compactContext(data: {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expenseCategories: Record<string, number>;
  recentTransactions: string[];
  transactionCount: number;
}): string {
  return [
    `Balance ₹${data.balance.toFixed(1)}`,
    `Income ₹${data.totalIncome.toFixed(1)}`,
    `Expense ₹${data.totalExpense.toFixed(1)}`,
    `Transactions: ${data.transactionCount}`,
    `Top Spending: ${Object.entries(data.expenseCategories)
      .slice(0, 2)
      .map(([cat, amt]) => `${cat}:₹${amt.toFixed(1)}`)
      .join(', ')}`,
    `Recent: ${data.recentTransactions.slice(0, 3).join(' | ')}`
  ].join(' • ');
}
