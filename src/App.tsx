import React, { useState, useEffect, useRef } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { 
  ShoppingCart, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  ChevronRight,
  Info,
  User,
  LogOut,
  X,
  Mail,
  Key,
  Menu,
  Settings,
  History,
  CreditCard as BillingIcon,
  HelpCircle,
  Star,
  Zap,
  Globe,
  Shield,
  Layers,
  Cpu,
  Activity,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRODUCTS = [
  { 
    id: '1', 
    name: 'Enterprise', 
    price: '199.00', 
    description: 'The ultimate solution for scale. Custom integrations, dedicated support, and unlimited throughput.',
    features: ['Unlimited API Calls', 'Custom Domain', 'SLA Guarantee', 'Dedicated Manager', 'Advanced Security'],
    tag: 'Enterprise',
    icon: Layers,
    color: 'indigo'
  },
  { 
    id: '2', 
    name: 'Professional', 
    price: '49.00', 
    description: 'Advanced tools for growing teams. Includes full analytics and collaboration features.',
    features: ['Up to 10 Users', 'Standard Support', 'Advanced Analytics', 'Team Collaboration'],
    tag: 'Popular',
    icon: Cpu,
    color: 'indigo'
  },
  { 
    id: '3', 
    name: 'Starter', 
    price: '19.00', 
    description: 'Essential features for individuals and hobbyists. Get started in minutes.',
    features: ['Single User', 'Community Support', 'Basic Analytics', 'Standard Security'],
    tag: null,
    icon: Activity,
    color: 'slate'
  },
];

const TRUST_LOGOS = [
  { name: 'Acme Corp', icon: Globe },
  { name: 'Global Tech', icon: Zap },
  { name: 'Securely', icon: Shield },
  { name: 'Stellar', icon: Star },
];

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[1]);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Auth check failed", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (res.ok) {
        if (authMode === 'login') {
          setUser(data.user);
          setIsAuthModalOpen(false);
        } else {
          setAuthMode('login');
          setAuthError('Account created! Please log in.');
        }
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Network error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsUserDropdownOpen(false);
  };

  const initialOptions = {
    clientId: (import.meta as any).env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  const createOrder = async () => {
    setPaymentStatus('processing');
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: selectedProduct.price }),
      });
      const order = await response.json();
      return order.id;
    } catch (error) {
      console.error("Error creating order:", error);
      setPaymentStatus('error');
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const details = await response.json();
      setOrderId(details.id);
      setPaymentStatus('success');
    } catch (error) {
      console.error("Error capturing order:", error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#0A0A0A] selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="border-b border-black/[0.04] bg-white/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-xl shadow-black/5">
              <CreditCard className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">PayHub<span className="text-indigo-600">.</span></span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-12 text-[12px] font-bold uppercase tracking-[0.15em] text-black/40">
            <a href="#" className="hover:text-black transition-all duration-300 relative group">
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#" className="hover:text-black transition-all duration-300 relative group">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#" className="hover:text-black transition-all duration-300 relative group">
              Developers
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full" />
            </a>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-3 text-black bg-black/[0.03] px-5 py-2.5 rounded-full hover:bg-black/[0.06] transition-all border border-black/[0.02]"
                >
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-indigo-600/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="normal-case tracking-normal font-bold">{user.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-black/[0.04] p-3 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-black/[0.03] mb-2">
                        <div className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-1.5">Account</div>
                        <div className="text-sm font-bold truncate">{user.email}</div>
                      </div>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-bold hover:bg-black/[0.03] rounded-2xl transition-all group">
                          <User className="w-4 h-4 text-black/20 group-hover:text-indigo-600 transition-colors" />
                          Profile Settings
                        </button>
                        <button className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-bold hover:bg-black/[0.03] rounded-2xl transition-all group">
                          <History className="w-4 h-4 text-black/20 group-hover:text-indigo-600 transition-colors" />
                          Transaction History
                        </button>
                        <button className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-bold hover:bg-black/[0.03] rounded-2xl transition-all group">
                          <BillingIcon className="w-4 h-4 text-black/20 group-hover:text-indigo-600 transition-colors" />
                          Billing Methods
                        </button>
                      </div>
                      <div className="h-px bg-black/[0.03] my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-black text-white px-8 py-3 rounded-full hover:bg-black/80 transition-all shadow-xl shadow-black/10 hover:shadow-black/20 active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 hover:bg-black/[0.03] rounded-2xl transition-all"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-black/[0.04] bg-white overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex flex-col gap-6">
                  <a href="#" className="text-2xl font-bold tracking-tight">Solutions</a>
                  <a href="#" className="text-2xl font-bold tracking-tight">Pricing</a>
                  <a href="#" className="text-2xl font-bold tracking-tight">Developers</a>
                </div>
                <div className="h-px bg-black/[0.04]" />
                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{user.name}</div>
                        <div className="text-sm text-black/30">{user.email}</div>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <button className="w-full flex items-center gap-4 py-3 text-sm font-bold">
                        <User className="w-5 h-5 text-black/20" /> Profile
                      </button>
                      <button className="w-full flex items-center gap-4 py-3 text-sm font-bold">
                        <History className="w-5 h-5 text-black/20" /> History
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 py-3 text-sm font-bold text-rose-500"
                      >
                        <LogOut className="w-5 h-5" /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-black text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-black/10"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-[1440px] mx-auto px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-20"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[12px] font-bold uppercase tracking-[0.2em] mb-10 shadow-sm border border-indigo-100/50">
                <ShieldCheck className="w-4 h-4" />
                Global Payment Infrastructure
              </div>
              <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-[0.82] mb-10">
                The future of <br />
                <span className="text-indigo-600">checkout.</span>
              </h1>
              <p className="text-2xl text-black/40 max-w-xl leading-relaxed font-medium tracking-tight">
                Scale your business with our enterprise-grade payment hub. Secure, seamless, and built for the modern web.
              </p>
            </motion.div>

            <div className="space-y-8">
              {PRODUCTS.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setSelectedProduct(product);
                    if (paymentStatus === 'success') setPaymentStatus('idle');
                  }}
                  className={`group relative p-10 rounded-[48px] border transition-all duration-700 cursor-pointer ${
                    selectedProduct.id === product.id
                      ? 'border-indigo-600 bg-white shadow-[0_48px_96px_-24px_rgba(79,70,229,0.15)]'
                      : 'border-black/[0.04] bg-white/50 hover:bg-white hover:border-black/[0.08] hover:shadow-xl hover:shadow-black/5'
                  }`}
                >
                  {product.tag && (
                    <div className="absolute -top-4 right-12 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-2xl shadow-indigo-600/30">
                      {product.tag}
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row justify-between gap-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-5 mb-6">
                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 ${
                          selectedProduct.id === product.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 rotate-6' : 'bg-black/[0.03] text-black/20'
                        }`}>
                          <product.icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className={`text-3xl font-bold tracking-tight transition-colors ${selectedProduct.id === product.id ? 'text-black' : 'text-black/30'}`}>
                            {product.name}
                          </h3>
                          {selectedProduct.id === product.id && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-1">
                              Selected Plan
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <p className={`text-lg leading-relaxed transition-colors max-w-md mb-10 ${selectedProduct.id === product.id ? 'text-black/60' : 'text-black/20'}`}>
                        {product.description}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10">
                        {product.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-3.5 text-[12px] font-bold text-black/30 uppercase tracking-widest">
                            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${selectedProduct.id === product.id ? 'bg-indigo-600 scale-125 shadow-lg shadow-indigo-600/50' : 'bg-black/10'}`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between items-end">
                      <div className="text-right">
                        <div className={`text-5xl font-bold tracking-tighter mb-2 ${selectedProduct.id === product.id ? 'text-black' : 'text-black/10'}`}>
                          ${product.price}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/20">
                          USD / Monthly
                        </div>
                      </div>
                      <div className={`mt-6 w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                        selectedProduct.id === product.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-inner' : 'border-black/[0.04] text-black/10'
                      }`}>
                        <ArrowUpRight className={`w-6 h-6 transition-transform duration-500 ${selectedProduct.id === product.id ? 'scale-110' : 'scale-90'}`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Section */}
            <div className="mt-32">
              <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-black/20 mb-12 text-center md:text-left">
                Empowering world-class organizations
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-20 opacity-20 grayscale contrast-150 transition-all duration-700 hover:opacity-40">
                {TRUST_LOGOS.map((logo) => (
                  <div key={logo.name} className="flex items-center gap-4 group cursor-default">
                    <logo.icon className="w-7 h-7 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="font-bold text-xl tracking-tighter">{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[64px] p-12 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] border border-black/[0.02] relative overflow-hidden"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-16">
                  <h2 className="text-3xl font-bold tracking-tight">Checkout</h2>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-[0.2em] shadow-sm border border-emerald-100/50">
                    <Lock className="w-3.5 h-3.5" />
                    Secure
                  </div>
                </div>

                <div className="space-y-10 mb-16">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/20 mb-3">Selected Tier</div>
                      <div className="font-bold text-2xl">{selectedProduct.name}</div>
                    </div>
                    <div className="font-bold text-2xl">${selectedProduct.price}</div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/20 mb-3">Service Fee</div>
                      <div className="font-bold text-2xl">Standard</div>
                    </div>
                    <div className="font-bold text-2xl">$0.00</div>
                  </div>

                  <div className="h-px bg-black/[0.04]" />

                  <div className="flex justify-between items-center">
                    <span className="text-4xl font-bold tracking-tighter">Total</span>
                    <div className="text-right">
                      <span className="text-6xl font-bold tracking-tighter text-indigo-600">${selectedProduct.price}</span>
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/20 mt-3">Billed in USD</div>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {paymentStatus === 'idle' || paymentStatus === 'processing' ? (
                    <motion.div
                      key="paypal-container"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative z-0"
                    >
                      <PayPalScriptProvider options={initialOptions}>
                        <PayPalButtons
                          style={{ 
                            layout: "vertical", 
                            shape: "rect", 
                            label: "pay",
                            height: 54
                          }}
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={() => setPaymentStatus('error')}
                        />
                      </PayPalScriptProvider>
                      <div className="mt-10 flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-[0.25em] text-black/20">
                        <ShieldCheck className="w-5 h-5" />
                        PCI-DSS Compliant
                      </div>
                    </motion.div>
                  ) : paymentStatus === 'success' ? (
                    <motion.div
                      key="success-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-[48px] flex items-center justify-center mx-auto mb-12 shadow-inner border border-emerald-100/50">
                        <CheckCircle2 className="w-16 h-16" />
                      </div>
                      <h3 className="text-4xl font-bold tracking-tight mb-5">Success</h3>
                      <p className="text-black/40 text-lg mb-12 leading-relaxed max-w-[300px] mx-auto font-medium">
                        Your transaction has been processed. Reference ID: <br />
                        <span className="font-mono text-indigo-600 font-bold mt-5 inline-block bg-indigo-50 px-5 py-2.5 rounded-2xl border border-indigo-100/50 shadow-sm">{orderId}</span>
                      </p>
                      <button
                        onClick={() => setPaymentStatus('idle')}
                        className="w-full py-6 bg-black text-white rounded-[28px] font-bold uppercase tracking-[0.2em] text-[12px] hover:bg-black/80 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-black/20 active:scale-95"
                      >
                        Launch Dashboard <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="error-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-32 h-32 bg-rose-50 text-rose-600 rounded-[48px] flex items-center justify-center mx-auto mb-12 shadow-inner border border-rose-100/50">
                        <AlertCircle className="w-16 h-16" />
                      </div>
                      <h3 className="text-4xl font-bold tracking-tight mb-5">Failed</h3>
                      <p className="text-black/40 text-lg mb-12 leading-relaxed max-w-[260px] mx-auto font-medium">
                        We encountered an issue. Please verify your payment method.
                      </p>
                      <button
                        onClick={() => setPaymentStatus('idle')}
                        className="w-full py-6 bg-rose-600 text-white rounded-[28px] font-bold uppercase tracking-[0.2em] text-[12px] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/30 active:scale-95"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <div className="mt-20 flex flex-wrap justify-center gap-14 opacity-10 grayscale contrast-150 hover:opacity-30 transition-all duration-1000">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-8" />
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[64px] p-16 shadow-2xl overflow-hidden border border-black/[0.04]"
            >
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-12 right-12 p-4 hover:bg-black/[0.03] rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-16">
                <h2 className="text-5xl font-bold tracking-tighter mb-4">
                  {authMode === 'login' ? 'Welcome.' : 'Join us.'}
                </h2>
                <p className="text-black/40 text-lg font-medium tracking-tight">
                  {authMode === 'login' ? 'Access your secure payment hub.' : 'Start your enterprise journey today.'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {authMode === 'register' && (
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full pl-16 pr-8 py-6 bg-black/[0.03] border-none rounded-[32px] focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all text-sm font-bold placeholder:text-black/20"
                    />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full pl-16 pr-8 py-6 bg-black/[0.03] border-none rounded-[32px] focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all text-sm font-bold placeholder:text-black/20"
                  />
                </div>
                <div className="relative group">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full pl-16 pr-8 py-6 bg-black/[0.03] border-none rounded-[32px] focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all text-sm font-bold placeholder:text-black/20"
                  />
                </div>

                {authError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-rose-50 text-rose-600 text-[12px] font-bold rounded-[28px] flex items-center gap-4 border border-rose-100"
                  >
                    <AlertCircle className="w-5 h-5" />
                    {authError}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full py-6 bg-black text-white rounded-[32px] font-bold uppercase tracking-[0.2em] text-[12px] hover:bg-black/80 transition-all mt-10 shadow-2xl shadow-black/20 active:scale-95"
                >
                  {authMode === 'login' ? 'Authenticate' : 'Create Account'}
                </button>
              </form>

              <div className="mt-12 text-center text-[14px]">
                <span className="text-black/30 font-medium">
                  {authMode === 'login' ? "New to PayHub?" : "Already a member?"}
                </span>
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="ml-3 font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t border-black/[0.04] bg-white py-40">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-24 mb-40">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-xl shadow-black/10">
                  <CreditCard className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-2xl tracking-tight">PayHub<span className="text-indigo-600">.</span></span>
              </div>
              <p className="text-black/30 text-lg max-w-sm leading-relaxed font-medium tracking-tight">
                The global standard for secure digital payments. Empowering the next generation of commerce with seamless integration and enterprise-grade security.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-[11px] uppercase tracking-[0.35em] text-black/20 mb-12">Product</h5>
              <ul className="space-y-7 text-sm font-bold">
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">Features</a></li>
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">Pricing</a></li>
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">Security</a></li>
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-[11px] uppercase tracking-[0.35em] text-black/20 mb-12">Company</h5>
              <ul className="space-y-7 text-sm font-bold">
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">About</a></li>
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">Careers</a></li>
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">Contact</a></li>
                <li><a href="#" className="text-black/60 hover:text-indigo-600 transition-all duration-300">Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-20 border-t border-black/[0.04] text-[11px] font-bold uppercase tracking-[0.35em] text-black/20">
            <p>© 2026 PayHub Global Systems. All rights reserved.</p>
            <div className="flex gap-20">
              <a href="#" className="hover:text-black transition-all duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-black transition-all duration-300">Terms of Service</a>
              <a href="#" className="hover:text-black transition-all duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
