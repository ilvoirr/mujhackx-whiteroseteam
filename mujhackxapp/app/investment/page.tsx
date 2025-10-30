"use client";
import { UserButton, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef, type KeyboardEvent, useCallback } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import {
IconArrowLeft,
IconBrandTabler,
IconSettings,
IconUserBolt,
IconMessageCircle,
IconHistory,
IconPlant,
IconPackage,
IconGift,
IconTool,
IconChartBar,
IconBrain,
IconReceipt,
IconPlus,
IconMinus,
IconTrash,
IconUsers,
IconTable,
IconCamera,
IconUpload,
IconRefresh,
IconSparkles,
IconTrendingUp,
IconTrendingDown,
IconCoin,
IconPigMoney,
IconWallet,
IconCreditCard,
IconShoppingCart,
IconHome,
IconCar,
IconPlane,
IconCoffee,
IconAlertTriangle,
IconTarget,
IconAward,
IconBadge,
IconUser,
IconBook,
IconSearch,
IconActivity,
IconArrowUp,
IconArrowDown,
IconClock,
IconNews,
IconCalendar,
IconBell,
IconX,
IconEdit,
IconCheck
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

// -------------------- Type Declarations --------------------
interface StockData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  marketCap?: string;
  name?: string;
  high52?: string;
  low52?: string;
  pe?: string;
  dividend?: string;
  beta?: string;
}

interface CompanyProfile {
  name: string;
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  logo: string;
  weburl: string;
  phone: string;
  finnhubIndustry: string;
}

interface MarketIndex {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
}

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface PortfolioStock {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  totalValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
}

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

export default function StockMarketPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // -------------------- Stock Market State --------------------
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [popularStocks, setPopularStocks] = useState<StockData[]>([]);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<StockData[]>([]);
  const [topLosers, setTopLosers] = useState<StockData[]>([]);
  const [mostActive, setMostActive] = useState<StockData[]>([]);
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Portfolio form state - simplified
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    shares: '',
    purchaseDate: new Date().toISOString().split('T')[0] // Default to today
  });

  // -------------------- Finnhub API Functions --------------------
  const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

  const fetchStockData = async (symbol: string): Promise<StockData | null> => {
    try {
      const [quoteResponse, profileResponse, metricsResponse] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`)
      ]);

      const quote = await quoteResponse.json();
      const profile = await profileResponse.json();
      const metrics = await metricsResponse.json();

      if (quote.c && quote.c > 0) {
        const change = quote.c - quote.pc;
        const changePercent = ((change / quote.pc) * 100);

        return {
          symbol: symbol,
          price: quote.c.toFixed(2),
          change: change.toFixed(2),
          changePercent: changePercent.toFixed(2),
          open: quote.o.toFixed(2),
          high: quote.h.toFixed(2),
          low: quote.l.toFixed(2),
          volume: quote.t ? quote.t.toLocaleString() : 'N/A',
          name: profile.name || symbol,
          high52: metrics?.metric?.['52WeekHigh']?.toFixed(2) || 'N/A',
          low52: metrics?.metric?.['52WeekLow']?.toFixed(2) || 'N/A',
          pe: metrics?.metric?.peBasicExclExtraTTM?.toFixed(2) || 'N/A',
          dividend: metrics?.metric?.currentDividendYieldTTM?.toFixed(2) || '0.00',
          beta: metrics?.metric?.beta?.toFixed(2) || 'N/A',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return null;
    }
  };

  const fetchCompanyProfile = async (symbol: string): Promise<CompanyProfile | null> => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
      );
      const data = await response.json();

      if (data.name) {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return null;
    }
  };

  const fetchMarketIndices = async () => {
    const indices = [
      { name: 'S&P 500', symbol: '^GSPC' },
      { name: 'NASDAQ', symbol: '^IXIC' },
      { name: 'Dow Jones', symbol: '^DJI' }
    ];

    const indexPromises = indices.map(async (index) => {
      const data = await fetchStockData(index.symbol);
      return data ? {
        name: index.name,
        symbol: index.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent
      } : null;
    });

    const results = await Promise.all(indexPromises);
    const validIndices = results.filter(index => index !== null) as MarketIndex[];
    setMarketIndices(validIndices);
  };

  const fetchMarketMovers = async () => {
    try {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM', 'UBER', 'PYPL', 'ADBE', 'INTC', 'CSCO'];
      const stockPromises = symbols.map(symbol => fetchStockData(symbol));
      const results = await Promise.all(stockPromises);
      const validStocks = results.filter(stock => stock !== null) as StockData[];

      const sortedByGain = [...validStocks].sort((a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent));
      const sortedByLoss = [...validStocks].sort((a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent));
      const sortedByVolume = [...validStocks].sort((a, b) => {
        const aVol = parseInt(a.volume.replace(/,/g, '')) || 0;
        const bVol = parseInt(b.volume.replace(/,/g, '')) || 0;
        return bVol - aVol;
      });

      setTopGainers(sortedByGain.slice(0, 6));
      setTopLosers(sortedByLoss.slice(0, 6));
      setMostActive(sortedByVolume.slice(0, 6));
    } catch (error) {
      console.error('Error fetching market movers:', error);
    }
  };

  const fetchMarketNews = async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`
      );
      const data = await response.json();
      setMarketNews(data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const searchStock = async () => {
    if (!searchSymbol.trim()) return;

    setSearchLoading(true);
    const stockData = await fetchStockData(searchSymbol.toUpperCase());
    if (stockData) {
      setSelectedStock(stockData);
      const companyData = await fetchCompanyProfile(searchSymbol.toUpperCase());
      setSelectedCompany(companyData);
    } else {
      alert('Stock not found! Try symbols like AAPL, GOOGL, MSFT, TSLA');
    }
    setSearchLoading(false);
  };

  const loadPopularStocks = async () => {
    setLoading(true);
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
    const stockPromises = symbols.map(symbol => fetchStockData(symbol));
    const results = await Promise.all(stockPromises);
    const validStocks = results.filter(stock => stock !== null) as StockData[];
    setPopularStocks(validStocks);
    setLoading(false);
  };

  const addToPortfolio = async () => {
    if (!newStock.symbol || !newStock.shares) {
      alert('Please enter stock symbol and number of shares');
      return;
    }

    const stockData = await fetchStockData(newStock.symbol.toUpperCase());
    if (!stockData) {
      alert('Stock not found!');
      return;
    }

    // Use current price as purchase price (assuming buying now)
    // In a real app, you could fetch historical data for the purchase date
    const purchasePrice = parseFloat(stockData.price);

    const portfolioStock: PortfolioStock = {
      symbol: newStock.symbol.toUpperCase(),
      name: stockData.name || newStock.symbol.toUpperCase(),
      shares: parseFloat(newStock.shares),
      purchasePrice: purchasePrice,
      purchaseDate: newStock.purchaseDate,
      currentPrice: purchasePrice,
      totalValue: parseFloat(newStock.shares) * purchasePrice,
      gainLoss: 0, // No gain/loss at purchase
      gainLossPercent: 0
    };

    const newPortfolio = [...portfolio, portfolioStock];
    setPortfolio(newPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(newPortfolio));
    
    setNewStock({ symbol: '', shares: '', purchaseDate: new Date().toISOString().split('T')[0] });
    setShowAddStock(false);
  };

  const removeFromPortfolio = (index: number) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    setPortfolio(newPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(newPortfolio));
  };

  const updatePortfolioPrices = async () => {
    if (portfolio.length === 0) return;

    const updatedPortfolio = await Promise.all(
      portfolio.map(async (stock) => {
        const stockData = await fetchStockData(stock.symbol);
        if (stockData) {
          const currentPrice = parseFloat(stockData.price);
          return {
            ...stock,
            currentPrice,
            totalValue: stock.shares * currentPrice,
            gainLoss: (currentPrice - stock.purchasePrice) * stock.shares,
            gainLossPercent: ((currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100
          };
        }
        return stock;
      })
    );

    setPortfolio(updatedPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
  };

  useEffect(() => {
    if (API_KEY) {
      loadPopularStocks();
      fetchMarketIndices();
      fetchMarketMovers();
      fetchMarketNews();
    }

    // Load from localStorage
    const savedPortfolio = localStorage.getItem('portfolio');
    
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, [API_KEY]);

  useEffect(() => {
    // Update portfolio prices every 5 minutes
    const interval = setInterval(() => {
      updatePortfolioPrices();
    }, 300000);

    return () => clearInterval(interval);
  }, [portfolio]);

  const links = [
    {
      label: "Balance Sheet",
      href: "/apppage",
      icon: (
        <IconReceipt className="h-7 w-7 shrink-0 text-white" />
      ),
      onClick: () => router.push('/apppage'),
    },
    {
      label: "Visualise Stats",
      href: "/visualise",
      icon: (
        <IconChartBar className="h-7 w-7 shrink-0 text-white" />
      ),
      onClick: () => router.push('/visualise'),
    },
    {
      label: "EY BFSI Dashboard",
      href: "/advice",
      icon: (
        <IconTable className="h-7 w-7 shrink-0 text-white" />
      ),
      onClick: () => router.push('/advice'),
    },
    {
      label: "Tata Loans Expert",
      href: "/chatbot",
      icon: (
        <IconMessageCircle className="h-7 w-7 shrink-0 text-white" />
      ),
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
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="ml-4 text-2xl font-bold text-white">Stock Market Hub</h1>
                    <p className="text-sm ml-4 text-gray-400">Comprehensive market analysis and portfolio tracking</p>
                  </div>
                </div>
              </div>

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

            {/* ============================================================
            STOCK MARKET CONTENT AREA
            ============================================================ */}
            <div className="min-h-[91vh] bg-[#1a1a1a] p-8">
              
              {/* Stock Search Section - Now always visible */}
              <div className="mb-8 ml-4">
                <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <IconSearch className="h-6 w-6" />
                    Search Stocks
                  </h2>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter stock symbol (e.g., AAPL, GOOGL, MSFT)"
                      value={searchSymbol}
                      onChange={(e) => setSearchSymbol(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchStock()}
                      className="flex-1 px-4 py-3 border border-gray-600 bg-[#1a1a1a] rounded-lg focus:border-white focus:outline-none text-white placeholder-gray-500"
                    />
                    <button
                      onClick={searchStock}
                      disabled={searchLoading || !API_KEY}
                      className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      {searchLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      ) : (
                        <IconSearch className="h-5 w-5" />
                      )}
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Selected Stock Display - Now always visible when a stock is selected */}
              {selectedStock && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="ml-4 bg-[#2a2a2a] rounded-xl shadow-lg p-8 border border-gray-700">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        {selectedCompany?.logo && (
                          <img
                            src={selectedCompany.logo}
                            alt={`${selectedStock.symbol} logo`}
                            className="w-16 h-16 rounded-lg object-contain bg-[#1a1a1a] p-2"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-white">{selectedStock.symbol}</h2>
                          </div>
                          <p className="text-gray-400">
                            {selectedCompany?.name || selectedStock.name || 'Real-time Stock Price'}
                          </p>
                          {selectedCompany && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <IconClock className="h-4 w-4" />
                              <span>{selectedCompany.exchange} • {selectedCompany.country}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-white">${selectedStock.price}</div>
                        <div className={`flex items-center gap-1 text-lg font-semibold ${
                          parseFloat(selectedStock.change) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {parseFloat(selectedStock.change) >= 0 ?
                            <IconArrowUp className="h-5 w-5" /> :
                            <IconArrowDown className="h-5 w-5" />
                          }
                          {selectedStock.change} ({selectedStock.changePercent}%)
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Stock Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Open</p>
                        <p className="text-xl font-semibold text-white">${selectedStock.open}</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">High</p>
                        <p className="text-xl font-semibold text-white">${selectedStock.high}</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Low</p>
                        <p className="text-xl font-semibold text-white">${selectedStock.low}</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Volume</p>
                        <p className="text-xl font-semibold text-white">{selectedStock.volume}</p>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">52W High</p>
                        <p className="text-xl font-semibold text-green-400">${selectedStock.high52}</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">52W Low</p>
                        <p className="text-xl font-semibold text-green-400">${selectedStock.low52}</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">P/E Ratio</p>
                        <p className="text-xl font-semibold text-green-400">{selectedStock.pe}</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Beta</p>
                        <p className="text-xl font-semibold text-green-400">{selectedStock.beta}</p>
                      </div>
                    </div>

                    {/* Company Information */}
                    {selectedCompany && (
                      <div className="border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-bold text-white mb-4">Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-[#1a1a1a] p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                            <p className="font-semibold text-white">
                              ${selectedCompany.marketCapitalization ?
                                (selectedCompany.marketCapitalization / 1000).toFixed(2) + 'B' :
                                'N/A'
                              }
                            </p>
                          </div>
                          <div className="bg-[#1a1a1a] p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Industry</p>
                            <p className="font-semibold text-white">{selectedCompany.finnhubIndustry || 'N/A'}</p>
                          </div>
                          <div className="bg-[#1a1a1a] p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">IPO Date</p>
                            <p className="font-semibold text-white">{selectedCompany.ipo || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Navigation Tabs */}
              <div className="mb-8 ml-4">
                <div className="flex space-x-1 bg-[#2a2a2a] rounded-lg p-1 border border-gray-700 w-fit">
                  {[
                    { id: 'overview', label: 'Market Overview', icon: IconActivity },
                    { id: 'portfolio', label: 'My Portfolio', icon: IconWallet },
                    { id: 'news', label: 'Market News', icon: IconNews }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200",
                        activeTab === tab.id
                          ? "bg-white text-black"
                          : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                      )}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <>
                  {/* Market Indices */}
                  {marketIndices.length > 0 && (
                    <div className="mb-8 ml-4">
                      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <IconChartBar className="h-6 w-6" />
                        Market Indices
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {marketIndices.map((index) => (
                          <div key={index.symbol} className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-bold text-white">{index.name}</h3>
                                <p className="text-sm text-gray-400">{index.symbol}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-white">{index.price}</div>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${
                                  parseFloat(index.change) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {parseFloat(index.change) >= 0 ?
                                    <IconArrowUp className="h-4 w-4" /> :
                                    <IconArrowDown className="h-4 w-4" />
                                  }
                                  {index.change} ({index.changePercent}%)
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Stocks Grid */}
                  <div className="mb-8 ml-4">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <IconActivity className="h-7 w-7" />
                        Popular Stocks
                      </h2>
                      <button
                        onClick={loadPopularStocks}
                        disabled={loading || !API_KEY}
                        className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                      >
                        <IconRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>

                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading stock data...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {popularStocks.map((stock) => (
                          <motion.div
                            key={stock.symbol}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-gray-500"
                            onClick={() => {
                              setSelectedStock(stock);
                              fetchCompanyProfile(stock.symbol).then(setSelectedCompany);
                            }}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-white">{stock.symbol}</h3>
                                <div className="flex items-center gap-1 text-sm">
                                  <span className="text-gray-400">{stock.name || 'Stock Price'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${
                                  parseFloat(stock.change) >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'
                                }`}>
                                  {parseFloat(stock.change) >= 0 ?
                                    <IconTrendingUp className="h-6 w-6 text-green-400" /> :
                                    <IconTrendingDown className="h-6 w-6 text-red-400" />
                                  }
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="text-2xl font-bold text-white mb-1">${stock.price}</div>
                              <div className={`flex items-center gap-1 ${
                                parseFloat(stock.change) >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {parseFloat(stock.change) >= 0 ?
                                  <IconArrowUp className="h-4 w-4" /> :
                                  <IconArrowDown className="h-4 w-4" />
                                }
                                <span className="font-semibold">
                                  {stock.change} ({stock.changePercent}%)
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between text-sm text-gray-400">
                              <span>High: ${stock.high}</span>
                              <span>Low: ${stock.low}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Market Movers - Moved below Popular Stocks */}
                  <div className="mb-8 ml-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Gainers */}
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <IconTrendingUp className="h-5 w-5 text-green-400" />
                        Top Gainers
                      </h3>
                      <div className="space-y-3">
                        {topGainers.slice(0, 5).map((stock) => (
                          <div key={stock.symbol} className="flex justify-between items-center p-2 hover:bg-[#1a1a1a] rounded-lg cursor-pointer"
                               onClick={() => setSelectedStock(stock)}>
                            <div>
                              <p className="font-semibold text-white">{stock.symbol}</p>
                              <p className="text-sm text-gray-400">${stock.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-semibold">+{stock.changePercent}%</p>
                              <p className="text-sm text-green-400">+{stock.change}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Losers */}
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <IconTrendingDown className="h-5 w-5 text-red-400" />
                        Top Losers
                      </h3>
                      <div className="space-y-3">
                        {topLosers.slice(0, 5).map((stock) => (
                          <div key={stock.symbol} className="flex justify-between items-center p-2 hover:bg-[#1a1a1a] rounded-lg cursor-pointer"
                               onClick={() => setSelectedStock(stock)}>
                            <div>
                              <p className="font-semibold text-white">{stock.symbol}</p>
                              <p className="text-sm text-gray-400">${stock.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-red-400 font-semibold">{stock.changePercent}%</p>
                              <p className="text-sm text-red-400">{stock.change}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Most Active */}
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <IconActivity className="h-5 w-5 text-white" />
                        Most Active
                      </h3>
                      <div className="space-y-3">
                        {mostActive.slice(0, 5).map((stock) => (
                          <div key={stock.symbol} className="flex justify-between items-center p-2 hover:bg-[#1a1a1a] rounded-lg cursor-pointer"
                               onClick={() => setSelectedStock(stock)}>
                            <div>
                              <p className="font-semibold text-white">{stock.symbol}</p>
                              <p className="text-sm text-gray-400">${stock.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Volume</p>
                              <p className="text-sm font-semibold text-white">{stock.volume}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Portfolio Tab */}
              {activeTab === 'portfolio' && (
                <div className="ml-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <IconWallet className="h-7 w-7" />
                      My Portfolio
                    </h2>
                    <div className="flex gap-3">
                      <button
                        onClick={updatePortfolioPrices}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
                      >
                        <IconRefresh className="h-5 w-5" />
                        Update Prices
                      </button>
                      <button
                        onClick={() => setShowAddStock(!showAddStock)}
                        className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
                      >
                        <IconPlus className="h-5 w-5" />
                        Add Stock
                      </button>
                    </div>
                  </div>

                  {/* Simplified Add Stock Form */}
                  {showAddStock && (
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700 mb-6">
                      <h3 className="text-lg font-bold text-white mb-4">Add Stock to Portfolio</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                          type="text"
                          placeholder="Stock Symbol (e.g., AAPL)"
                          value={newStock.symbol}
                          onChange={(e) => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                          className="px-3 py-2 border border-gray-600 bg-[#1a1a1a] rounded-lg focus:border-white focus:outline-none text-white"
                        />
                        <input
                          type="number"
                          placeholder="Number of Shares"
                          value={newStock.shares}
                          onChange={(e) => setNewStock({...newStock, shares: e.target.value})}
                          className="px-3 py-2 border border-gray-600 bg-[#1a1a1a] rounded-lg focus:border-white focus:outline-none text-white"
                        />
                        <input
                          type="date"
                          value={newStock.purchaseDate}
                          onChange={(e) => setNewStock({...newStock, purchaseDate: e.target.value})}
                          className="px-3 py-2 border border-gray-600 bg-[#1a1a1a] rounded-lg focus:border-white focus:outline-none text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={addToPortfolio}
                            className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <IconCheck className="h-5 w-5" />
                            Add
                          </button>
                          <button
                            onClick={() => setShowAddStock(false)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                          >
                            <IconX className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-3">Purchase price will be set to current market price. Date is for reference only.</p>
                    </div>
                  )}

                  {/* Portfolio Summary */}
                  {portfolio.length > 0 && (
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-6 border border-gray-700 mb-6">
                      <h3 className="text-lg font-bold text-white mb-4">Portfolio Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-400 mb-1">Total Value</p>
                          <p className="text-2xl font-bold text-green-400">
                            ${portfolio.reduce((sum, stock) => sum + (stock.totalValue || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-400 mb-1">Total Invested</p>
                          <p className="text-2xl font-bold text-white">
                            ${portfolio.reduce((sum, stock) => sum + (stock.shares * stock.purchasePrice), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-400 mb-1">Total Gain/Loss</p>
                          <p className={`text-2xl font-bold ${
                            portfolio.reduce((sum, stock) => sum + (stock.gainLoss || 0), 0) >= 0 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            ${portfolio.reduce((sum, stock) => sum + (stock.gainLoss || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                          <p className="text-sm text-gray-400 mb-1">Total Stocks</p>
                          <p className="text-2xl font-bold text-white">{portfolio.length}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Portfolio Stocks */}
                  {portfolio.length > 0 ? (
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#1a1a1a] border-b border-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Symbol</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Shares</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Purchase Price</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Current Price</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Total Value</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Gain/Loss</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">%</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {portfolio.map((stock, index) => (
                              <tr key={index} className="hover:bg-[#1a1a1a]">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-bold text-white">{stock.symbol}</div>
                                    <div className="text-sm text-gray-400">{stock.name}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{stock.shares}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${stock.purchasePrice.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${stock.currentPrice?.toFixed(2) || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">${stock.totalValue?.toFixed(2) || 'N/A'}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                  (stock.gainLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  ${stock.gainLoss?.toFixed(2) || 'N/A'}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                  (stock.gainLossPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {stock.gainLossPercent?.toFixed(2) || 'N/A'}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{stock.purchaseDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => removeFromPortfolio(index)}
                                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                  >
                                    <IconTrash className="h-5 w-5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-12 text-center border border-gray-700">
                      <IconWallet className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Stocks in Portfolio</h3>
                      <p className="text-gray-400 mb-6">Add your first stock to start tracking your investments</p>
                      <button
                        onClick={() => setShowAddStock(true)}
                        className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 mx-auto"
                      >
                        <IconPlus className="h-5 w-5" />
                        Add Your First Stock
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* News Tab */}
              {activeTab === 'news' && (
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <IconNews className="h-7 w-7" />
                    Market News
                  </h2>
                  
                  {marketNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {marketNews.map((news) => (
                        <a
                          key={news.id}
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#2a2a2a] rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-300 cursor-pointer group"
                        >
                          {news.image && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={news.image}
                                alt={news.headline}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-gray-400 uppercase">{news.source}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(news.datetime * 1000).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gray-300 transition-colors">
                              {news.headline}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-3">{news.summary}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#2a2a2a] rounded-xl shadow-lg p-12 text-center border border-gray-700">
                      <IconNews className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No News Available</h3>
                      <p className="text-gray-400">Check back later for the latest market news</p>
                    </div>
                  )}
                </div>
              )}
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
