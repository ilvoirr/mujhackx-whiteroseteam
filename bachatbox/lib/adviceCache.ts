export const adviceCache = new Map<string, string>();

export function cosineSim(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(w => words2.includes(w)).length;
  const magnitude = Math.sqrt(words1.length * words2.length);
  
  return magnitude > 0 ? intersection / magnitude : 0;
}

export function compactContext(financialData: any): string {
  return `Balance: ₹${financialData.balance}, Income: ₹${financialData.totalIncome}, Expense: ₹${financialData.totalExpense}`;
}
