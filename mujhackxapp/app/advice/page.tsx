"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import {
  IconReceipt,
  IconChartBar,
  IconTable,
  IconMessageCircle,
  IconBook,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconSparkles,
  IconRefresh,
  IconLoader,
  IconShield,
  IconBrain,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  timestamp: Date;
};

type AdviceData = {
  healthScore: number;
  healthStatus: string;
  topSpending: string;
  savingsOpportunity: string;
  monthlyTrend: string;
  budgetStatus: string;
  recommendations: string[];
  insights: string[];
  goals: string[];
};

const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white">
      <div className="text-white w-[4vh] h-[4vh] md:w-[3vh] md:h-[3vh] flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full"
        >
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
        </svg>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[1.4vw] font-semibold tracking-tight text-white"
      >
        Tata Capital
      </motion.span>
    </div>
  );
};

const LogoIcon = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white">
      <div className="text-white w-[4vh] h-[4vh] md:w-[3vh] md:h-[3vh] flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full"
        >
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zM10.91 15.5l-3.41-3.41l1.41-1.41l2 2l4.59-4.59l1.41 1.41l-6 6z" />
        </svg>
      </div>
    </div>
  );
};

// Updated AdviceCard Component with luxury black theme
const AdviceCard = ({ title, content, icon, className, delay = 0 }: {
  title: string;
  content: string;
  icon: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={cn(
        "bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-700",
        "flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg text-white flex-shrink-0">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-100 text-lg">{title}</h3>
      </div>
      <p className="text-gray-300 leading-relaxed flex-1 flex items-center">{content}</p>
    </motion.div>
  );
};

// Updated ScoreCard Component with luxury black theme
const ScoreCard = ({ score, status, delay = 0 }: {
  score: number;
  status: string;
  delay?: number;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay }}
      className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 shadow-2xl h-full flex flex-col justify-center items-center border border-gray-700"
    >
      <div className="mb-4 text-center">
        <div className={cn("text-6xl font-bold", getScoreColor(score))}>
          {score}
        </div>
        <div className="text-gray-400 text-sm mt-2">Financial Health Score</div>
      </div>
      <div className="text-gray-200 font-medium text-center">{status}</div>
    </motion.div>
  );
};

export default function AdvicePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<string>('');
  const [adviceData, setAdviceData] = useState<AdviceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState(0);

  // Local Storage Functions
  const getStorageKey = () => {
    return user?.id ? `bachatbox_${user.id}_transactions` : null;
  };

  const getBudgetKey = () => {
    return user?.id ? `bachatbox_${user.id}_budget` : null;
  };

  const loadTransactions = () => {
    const key = getStorageKey();
    if (key) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp)
          }));
        } catch (error) {
          console.error('Error parsing stored transactions:', error);
          return [];
        }
      }
    }
    return [];
  };

  const loadBudget = () => {
    const key = getBudgetKey();
    if (key) {
      const storedBudget = localStorage.getItem(key);
      if (storedBudget) {
        return storedBudget;
      }
    }
    return '';
  };

  // Load data on mount
  useEffect(() => {
    if (isLoaded && user?.id) {
      const storedTransactions = loadTransactions();
      setTransactions(storedTransactions);
      const storedBudget = loadBudget();
      setBudget(storedBudget);
    }
  }, [isLoaded, user?.id]);

  // Generate AI advice
  const generateAdvice = async () => {
    console.log('🚀 FRONTEND: Generate Advice Called');
    
    if (transactions.length === 0) {
      console.warn('⚠️ No transactions available');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          budget,
          userId: user?.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAdviceData(data.advice);
        setLayoutVariant(Math.floor(Math.random() * 3));
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ FRONTEND ERROR:', error);
      alert(`Frontend error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const links = [
    {
      label: "Balance Sheet",
      href: "/apppage",
      icon: <IconReceipt className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/apppage'),
    },
    {
      label: "Visualise Stats",
      href: "/visualise",
      icon: <IconChartBar className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/visualise'),
    },
    {
      label: "Tata BFSI Dashboard",
      href: "/advice",
      icon: <IconTable className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/advice'),
    },
    {
      label: "Tata Loans Expert",
      href: "/chatbot",
      icon: <IconMessageCircle className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/chatbot'),
    },
    {
      label: "Financial Reads",
      href: "/financial-reads",
      icon: <IconBook className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/financial-reads'),
    },
    {
      label: "Stock Market",
      href: "/investment",
      icon: <IconTrendingUp className="h-7 w-7 shrink-0 text-white" />,
      onClick: () => router.push('/investment'),
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Calculate quick stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Layout variants with proper height distribution
  const renderAdviceDashboard = () => {
    if (!adviceData) return null;

    const layouts = [
      // Layout 1: Grid with score prominently displayed
      <div key="layout1" className="grid grid-cols-12 grid-rows-6 gap-6 h-full">
        <div className="col-span-4 row-span-4 flex">
          <div className="flex-1">
            <ScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} />
          </div>
        </div>
        <div className="col-span-8 row-span-4 grid grid-cols-2 gap-4 h-full">
          <AdviceCard
            title="Top Spending"
            content={adviceData.topSpending}
            icon={<IconTrendingDown className="w-5 h-5" />}
            delay={0.4}
            className="h-full"
          />
          <AdviceCard
            title="Savings Opportunity"
            content={adviceData.savingsOpportunity}
            icon={<IconTarget className="w-5 h-5" />}
            delay={0.6}
            className="h-full"
          />
          <AdviceCard
            title="Monthly Trend"
            content={adviceData.monthlyTrend}
            icon={<IconTrendingUp className="w-5 h-5" />}
            delay={0.8}
            className="col-span-2 h-full"
          />
        </div>
        <div className="col-span-12 row-span-2 grid grid-cols-3 gap-4 h-full">
          {adviceData.recommendations.slice(0, 3).map((rec, idx) => (
            <AdviceCard
              key={idx}
              title={`Recommendation ${idx + 1}`}
              content={rec}
              icon={<IconSparkles className="w-5 h-5" />}
              delay={1 + idx * 0.2}
              className="h-full"
            />
          ))}
        </div>
      </div>,

      // Layout 2: Vertical flow with insights
      <div key="layout2" className="flex gap-6 h-full">
        <div className="flex-1 flex flex-col space-y-4 h-full">
          <div className="flex-1">
            <ScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} />
          </div>
          <div className="flex-1">
            <AdviceCard
              title="Budget Analysis"
              content={adviceData.budgetStatus}
              icon={<IconShield className="w-5 h-5" />}
              delay={0.4}
              className="h-full"
            />
          </div>
        </div>
        <div className="flex-2 grid grid-rows-4 gap-4 h-full">
          <AdviceCard
            title="Key Insight"
            content={adviceData.insights[0] || "Track your spending patterns"}
            icon={<IconBrain className="w-5 h-5" />}
            delay={0.6}
            className="row-span-1 h-full"
          />
          {adviceData.goals.slice(0, 3).map((goal, idx) => (
            <AdviceCard
              key={idx}
              title={`Goal ${idx + 1}`}
              content={goal}
              icon={<IconTarget className="w-5 h-5" />}
              delay={0.8 + idx * 0.2}
              className="row-span-1 h-full"
            />
          ))}
        </div>
      </div>,

      // Layout 3: Masonry-style asymmetric layout
      <div key="layout3" className="grid grid-cols-4 grid-rows-4 gap-4 h-full">
        <div className="col-span-2 row-span-3">
          <ScoreCard score={adviceData.healthScore} status={adviceData.healthStatus} delay={0.2} />
        </div>
        <div className="col-span-2 row-span-2 grid grid-rows-2 gap-4 h-full">
          <AdviceCard
            title="Smart Insight"
            content={adviceData.insights[0] || "AI analyzed your patterns"}
            icon={<IconBrain className="w-5 h-5" />}
            delay={0.4}
            className="h-full"
          />
          <AdviceCard
            title="Savings Focus"
            content={adviceData.savingsOpportunity}
            icon={<IconTarget className="w-5 h-5" />}
            delay={0.6}
            className="h-full"
          />
        </div>
        <div className="col-span-2 row-span-1">
          <AdviceCard
            title="Budget Status"
            content={adviceData.budgetStatus}
            icon={<IconShield className="w-5 h-5" />}
            delay={0.7}
            className="h-full"
          />
        </div>
        <div className="col-span-4 row-span-1 grid grid-cols-3 gap-4 h-full">
          {adviceData.recommendations.slice(0, 3).map((rec, idx) => (
            <AdviceCard
              key={idx}
              title={`Action ${idx + 1}`}
              content={rec}
              icon={<IconSparkles className="w-5 h-5" />}
              delay={0.8 + idx * 0.2}
              className="h-full"
            />
          ))}
        </div>
      </div>
    ];

    return layouts[layoutVariant];
  };

  return (
    <>
      <SignedIn>
        <div className="bg-[#1a1a1a] min-h-screen">
          {/* Fixed Sidebar */}
          <div className="fixed top-0 left-0 h-screen z-30">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
              <SidebarBody className="justify-between gap-10 bg-[#1a1a1a] h-full">
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                  <div 
                    className="cursor-pointer py-2"
                    onMouseEnter={() => setSidebarOpen(true)}
                    onMouseLeave={() => setSidebarOpen(false)}
                  >
                    {sidebarOpen ? <Logo /> : <LogoIcon />}
                  </div>
                  <div className="mt-8 flex flex-col gap-2">
                    {links.map((link, idx) => (
                      <div key={idx} onClick={link.onClick} className="cursor-pointer">
                        <SidebarLink link={link} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <SidebarLink
                    link={{
                      label: user?.username || 'User',
                      href: "#",
                      icon: (
                        <div className="h-7 w-7 shrink-0 rounded-full bg-white text-black flex items-center justify-center text-sm font-semibold">
                          {(user?.username?.[0] || user?.firstName?.[0] || 'U').toUpperCase()}
                        </div>
                      ),
                    }}
                  />
                </div>
              </SidebarBody>
            </Sidebar>
          </div>

          {/* Main Content Area with left margin for sidebar */}
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            sidebarOpen ? "ml-64" : "ml-16"
          )}>
            {/* Fixed Top Navbar */}
            <div className="sticky top-0 z-20 flex items-center h-[9.5vh] bg-[#1a1a1a] px-8 border-b border-gray-700/50">
              <div className="flex-1" />
              
              <div
                className="inline-flex w-[30vw] md:w-[7.5vw] items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-100 md:px-4 md:py-[0.45vw] py-[0.6vh] px-[0.5vw] text-lg font-semibold text-black shadow-sm ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => {
                  const btn = triggerRef.current?.querySelector('button');
                  btn?.click();
                }}
              >
                <span className='md:text-[1.1vw] text-[2vh]'>{user?.username || 'User'}</span>
                <div ref={triggerRef} className="relative">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonPopoverCard: {
                          transform: 'translateY(3.5vh)',
                          '@media (max-width: 768px)': {
                            transform: 'translateY(3.5vh) translateX(4vw)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-[#1a1a1a]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-[90.5vh]"
                  >
                    <div className="text-center">
                      <IconLoader className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Analyzing finances</p>
                    </div>
                  </motion.div>
                ) : adviceData ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 h-[90.5vh] flex flex-col"
                  >
                    {/* Generate New Advice Button */}
                    <div className="mb-6 flex justify-between items-center flex-shrink-0">
                      <h1 className="text-3xl ml-8 font-bold text-gray-100">Tata BFSI Dashboard</h1>
                      <button
                        onClick={generateAdvice}
                        className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-200 rounded-lg font-medium transition-colors border border-gray-700"
                      >
                        Regenerate
                      </button>
                    </div>
                    
                    {/* Dynamic Dashboard Layout */}
                    <div className="flex-1 ml-8 min-h-0">
                      {renderAdviceDashboard()}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-6xl mx-auto p-6 h-[90.5vh] flex items-center justify-center"
                  >
                    {transactions.length > 0 ? (
                      <div className="text-center">
                        <h1 className="text-3xl font-medium text-gray-100 mb-3">Tata BFSI Dashboard</h1>
                        <p className="text-gray-400 text-base mb-10 max-w-xl mx-auto">
                          Analyze your financial data and receive personalized insights
                        </p>
                        
                        {/* Quick Stats Preview */}
                        <div className="grid grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
  <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
    <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Income</div>
    <div className="text-2xl font-semibold text-gray-200">{formatCurrency(totalIncome)}</div>
  </div>
  <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
    <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Expenses</div>
    <div className="text-2xl font-semibold text-gray-200">{formatCurrency(totalExpenses)}</div>
  </div>
  <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
    <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Balance</div>
    <div className={`text-2xl font-semibold ${balance >= 0 ? 'text-gray-200' : 'text-red-400'}`}>
      {formatCurrency(balance)}
    </div>
  </div>
</div>


                        <button
                          onClick={generateAdvice}
                          className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-gray-200 rounded-lg font-medium transition-colors border border-gray-700"
                        >
                          Generate Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800 max-w-md">
                        <IconChartBar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No Data Available</h3>
                        <p className="text-gray-500 text-sm mb-6">
                          Add transactions to receive financial insights
                        </p>
                        <button
                          onClick={() => router.push('/apppage')}
                          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium transition-colors border border-gray-700"
                        >
                          Add Transactions
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
