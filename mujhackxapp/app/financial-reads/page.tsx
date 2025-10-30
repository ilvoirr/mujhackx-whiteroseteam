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
  IconUsers,
  IconBook,
  IconSparkles,
  IconPlus,
  IconX,
  IconChevronUp,
  IconTrendingUp
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

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
        EY Capital
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

// Type definitions
interface FinancialArticle {
  id: number;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  tags: string[];
  upvotes: number;
  author: string;
  createdAt: string;
}

type ExpandedState = { [key: number]: boolean };

// Financial Reads Component
const FinancialReadsContent = () => {
  const [isExpanded, setIsExpanded] = useState<ExpandedState>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [articles, setArticles] = useState<FinancialArticle[]>([]);
  const { user } = useUser();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    readTime: '',
    summary: '',
    content: '',
    tags: ''
  });

  // Load articles from localStorage on component mount
  useEffect(() => {
    const savedArticles = localStorage.getItem('financialArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      // Initialize with default articles (keeping same content, just changing theme)
      const defaultArticles: FinancialArticle[] = [
        {
          id: 1,
          title: "Emergency Fund Essentials: Your Financial Safety Net",
          category: "Personal Finance Basics",
          readTime: "5 min read",
          summary: "Learn why having 3-6 months of expenses saved is crucial and how to build your emergency fund systematically.",
          content: `An emergency fund represents one of the most fundamental pillars of personal financial security, yet countless individuals find themselves navigating life without this crucial safety net. Think of your emergency fund as a financial cushion that stands between you and potential financial catastrophe when unexpected expenses arise.

Life has a way of throwing curveballs when we least expect them. Your car breaks down on the way to an important job interview. A medical emergency requires immediate attention and costly treatment. Your employer announces sudden layoffs, leaving you without income. Your home's heating system fails during the coldest week of winter. These scenarios aren't just hypothetical possibilities but real situations that millions of people face every year.

Without an emergency fund, these unexpected events often force individuals into a cycle of debt. They reach for credit cards, take out personal loans with high interest rates, or worse, borrow against retirement accounts. Each of these solutions creates additional financial stress and can derail long-term financial goals.

The general recommendation suggests maintaining three to six months of living expenses in your emergency fund. However, this range isn't arbitrary. The appropriate amount depends on several personal factors including job security, health status, number of dependents, and overall financial stability.

Building an emergency fund from scratch can feel overwhelming, especially when living paycheck to paycheck. The key lies in starting small and building momentum. Begin with a micro-goal of saving just $500. This amount can cover many minor emergencies like a small car repair or medical co-pay.

Automation makes emergency fund building virtually effortless. Set up an automatic transfer from your checking account to a dedicated savings account immediately after each paycheck arrives. Even if you can only afford $25 per week, you'll accumulate $1,300 over the course of a year.`,
          tags: ["Emergency Fund", "Savings", "Financial Security"],
          upvotes: 15,
          author: "EY Capital Team",
          createdAt: "2025-09-01"
        },
        {
          id: 2,
          title: "The 50/30/20 Budget Rule Explained",
          category: "Budgeting",
          readTime: "4 min read",
          summary: "Master the simple budgeting framework that allocates 50% for needs, 30% for wants, and 20% for savings.",
          content: `The 50/30/20 budgeting rule has gained tremendous popularity among personal finance experts and everyday money managers because of its elegant simplicity and practical effectiveness. This framework provides a straightforward approach to managing money without getting bogged down in complicated spreadsheets.

At its core, the 50/30/20 rule divides your after-tax income into three broad categories. Fifty percent goes toward needs, thirty percent toward wants, and twenty percent toward savings and debt repayment. This division strikes a balance between covering essential expenses, enjoying life in the present, and securing your financial future.

Understanding the distinction between needs and wants forms the foundation of successful budgeting. Needs represent expenses absolutely essential for survival and basic functioning in society. These include housing costs like rent or mortgage payments, utilities such as electricity and water, groceries for basic nutrition, transportation to work, insurance premiums, and minimum debt payments.

The wants category encompasses everything that enhances your quality of life but isn't strictly necessary for survival. This includes dining out, entertainment subscriptions, hobbies, gym memberships, personal care beyond basic necessities, and shopping for non-essential items.

Implementing the 50/30/20 rule requires accurate tracking of your current spending patterns. Start by reviewing several months of bank and credit card statements to understand where your money actually goes. Many people discover significant surprises during this exercise.`,
          tags: ["Budgeting", "Money Management", "Financial Planning"],
          upvotes: 12,
          author: "EY Capital Team",
          createdAt: "2025-09-02"
        },
        {
          id: 3,
          title: "Investment Basics for Beginners",
          category: "Investing",
          readTime: "7 min read",
          summary: "Understand the fundamentals of investing, from compound interest to diversification strategies.",
          content: `Investing represents one of the most powerful tools for building long-term wealth, yet many people avoid it due to perceived complexity or fear of losing money. The reality is that investing operates on relatively straightforward principles that anyone can learn and apply successfully.

The fundamental concept underlying all investing is putting your money to work to generate additional income or growth over time. Instead of letting cash sit in low-yield savings accounts where inflation gradually erodes purchasing power, investing allows your money to potentially grow faster than the rate of inflation.

Compound interest serves as the engine that drives long-term investment success. When you invest money and earn returns, those returns themselves begin earning returns in subsequent years. This compounding effect becomes increasingly powerful over longer time horizons.

Risk and return represent two sides of the same investment coin. Generally speaking, investments offering higher potential returns also carry higher risk of loss. Government bonds offer relatively low returns but high security, while stocks historically provide higher returns but with significantly more volatility.

Diversification reduces investment risk without necessarily reducing expected returns. Rather than putting all your money into a single stock or asset class, spreading investments across different companies, industries, and asset types helps protect against significant losses.`,
          tags: ["Investing", "Compound Interest", "Index Funds"],
          upvotes: 8,
          author: "EY Capital Team",
          createdAt: "2025-09-03"
        },
        {
          id: 4,
          title: "Understanding Credit Scores and Reports",
          category: "Credit Management",
          readTime: "6 min read",
          summary: "Learn how credit scores work, what affects them, and strategies to improve your creditworthiness.",
          content: `Your credit score functions as a financial report card that influences countless aspects of your economic life, from the interest rates you receive on loans to your ability to rent apartments or even secure certain jobs.

Credit scores represent numerical summaries of your credit history, typically ranging from 300 to 850. These three-digit numbers attempt to predict the likelihood that you'll repay borrowed money as agreed. Lenders use credit scores to make quick decisions about loan approvals and interest rates.

Payment history carries the most weight in credit score calculations, typically accounting for about 35% of your FICO score. This factor examines whether you've made payments on time for credit cards, loans, mortgages, and other credit accounts.

Credit utilization, representing about 30% of your FICO score, measures how much of your available credit you're actually using. Lower utilization ratios generally result in higher credit scores, with most experts recommending keeping total utilization below 30%.

Building credit from scratch requires patience and strategic planning. Young adults or immigrants without credit history might start with secured credit cards, which require cash deposits that serve as credit limits.`,
          tags: ["Credit Score", "Credit Report", "Financial Health"],
          upvotes: 6,
          author: "EY Capital Team",
          createdAt: "2025-09-04"
        }
      ];
      setArticles(defaultArticles);
      localStorage.setItem('financialArticles', JSON.stringify(defaultArticles));
    }
  }, []);

  // Save articles to localStorage whenever articles change
  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('financialArticles', JSON.stringify(articles));
    }
  }, [articles]);

  // Sort articles by upvotes (descending)
  const sortedArticles = [...articles].sort((a, b) => b.upvotes - a.upvotes);

  const toggleExpanded = (id: number) => {
    setIsExpanded((prev: ExpandedState) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpvote = (id: number) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === id 
          ? { ...article, upvotes: article.upvotes + 1 }
          : article
      )
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newArticle: FinancialArticle = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      readTime: formData.readTime,
      summary: formData.summary,
      content: formData.content,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      upvotes: 0,
      author: user?.username || user?.firstName || 'Anonymous',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setArticles(prevArticles => [newArticle, ...prevArticles]);
    
    setFormData({
      title: '',
      category: '',
      readTime: '',
      summary: '',
      content: '',
      tags: ''
    });
    
    setShowCreateForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="px-8 py-6">
      {/* Header Section */}
      <div className="mb-8 ml-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-100">Financial Education Hub</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg font-medium transition-colors duration-200 border border-gray-300"
          >
            <IconPlus className="h-5 w-5" />
            Create Article
          </button>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl">
          Master your money with these essential financial literacy articles. Build better financial habits, one read at a time.
        </p>
      </div>

      {/* Create Article Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-100">Create New Article</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <IconX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    placeholder="Enter article title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Personal Finance Basics">Personal Finance Basics</option>
                      <option value="Budgeting">Budgeting</option>
                      <option value="Investing">Investing</option>
                      <option value="Credit Management">Credit Management</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Tax Planning">Tax Planning</option>
                      <option value="Retirement Planning">Retirement Planning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Read Time</label>
                    <input
                      type="text"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                      placeholder="e.g., 5 min read"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Summary</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent resize-vertical"
                    placeholder="Brief summary of the article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={10}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent resize-vertical"
                    placeholder="Full article content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-md font-medium transition-colors duration-200"
                  >
                    Create Article
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded-md font-medium transition-colors duration-200 border border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-6 ml-4">
        {sortedArticles.map((article) => (
          <div key={article.id} className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-300 border border-gray-700">
            <div className="p-6">
              {/* Article Header */}
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-800 text-gray-200 text-sm font-medium px-3 py-1 rounded-full border border-gray-700">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-500">by {article.author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{article.readTime}</span>
                  <button
                    onClick={() => handleUpvote(article.id)}
                    className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full transition-colors duration-200 border border-gray-700"
                  >
                    <IconChevronUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{article.upvotes}</span>
                  </button>
                </div>
              </div>

              {/* Title and Summary */}
              <h2 className="text-xl font-bold text-gray-100 mb-3">
                {article.title}
              </h2>
              <p className="text-gray-400 mb-4 leading-relaxed">
                {article.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded border border-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleExpanded(article.id)}
                className="inline-flex items-center text-gray-300 hover:text-white font-medium transition-colors duration-200"
              >
                {isExpanded[article.id] ? 'Read Less' : 'Read More'}
                <svg
                  className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${
                    isExpanded[article.id] ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content */}
              {isExpanded[article.id] && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <div className="prose prose-invert max-w-none">
                    {article.content.split('\n').map((paragraph, index) => {
                      if (paragraph.trim() === '') return null;
                      
                      return (
                        <p key={index} className="mb-3 text-gray-300 leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FinancialReadsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      label: "EY BFSI Dashboard",
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

            {/* Page Content */}
            <div className="min-h-[calc(100vh-9.5vh)] bg-[#1a1a1a]">
              <FinancialReadsContent />
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
