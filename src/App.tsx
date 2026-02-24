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
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRODUCTS = [
  { 
    id: '1', 
    name: 'Enterprise License', 
    price: '199.00', 
    description: 'Full access for up to 50 users with priority 24/7 support and custom integration.',
    tag: 'Popular'
  },
  { 
    id: '2', 
    name: 'Professional Tier', 
    price: '49.00', 
    description: 'Advanced features for individuals and small teams. Includes API access.',
    tag: null
  },
  { 
    id: '3', 
    name: 'Starter Pack', 
    price: '19.00', 
    description: 'Essential tools to get your project off the ground. Perfect for hobbyists.',
    tag: null
  },
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
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#1A1A1A] selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
              <CreditCard className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase italic">PayHub.</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 text-[13px] font-semibold uppercase tracking-widest text-black/40">
            <a href="#" className="hover:text-black transition-colors">Solutions</a>
            <a href="#" className="hover:text-black transition-colors">Pricing</a>
            <a href="#" className="hover:text-black transition-colors">Developers</a>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 text-black bg-black/5 px-4 py-2 rounded-full hover:bg-black/10 transition-all"
                >
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="normal-case tracking-normal font-bold">{user.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-black/5 p-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-black/5 mb-1">
                        <div className="text-xs font-bold text-black/30 uppercase tracking-widest mb-1">Signed in as</div>
                        <div className="text-sm font-bold truncate">{user.email}</div>
                      </div>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-black/5 rounded-xl transition-colors">
                        <User className="w-4 h-4 text-black/40" />
                        Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-black/5 rounded-xl transition-colors">
                        <History className="w-4 h-4 text-black/40" />
                        Transaction History
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-black/5 rounded-xl transition-colors">
                        <BillingIcon className="w-4 h-4 text-black/40" />
                        Billing Methods
                      </button>
                      <div className="h-px bg-black/5 my-1" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
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
                className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-black/80 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-black/5 rounded-xl transition-colors"
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
              className="md:hidden border-t border-black/5 bg-white overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-lg font-bold">Solutions</a>
                  <a href="#" className="text-lg font-bold">Pricing</a>
                  <a href="#" className="text-lg font-bold">Developers</a>
                </div>
                <div className="h-px bg-black/5" />
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-black/40">{user.email}</div>
                      </div>
                    </div>
                    <button className="w-full flex items-center gap-3 py-2 text-sm font-bold">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-3 py-2 text-sm font-bold">
                      <History className="w-4 h-4" /> History
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 py-2 text-sm font-bold text-rose-500"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-6">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Checkout
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[0.9] mb-6">
                Choose your <br />
                <span className="text-indigo-600">experience.</span>
              </h1>
              <p className="text-lg text-black/50 max-w-lg leading-relaxed">
                Select the plan that best fits your needs. All payments are processed securely via PayPal's global infrastructure.
              </p>
            </motion.div>

            <div className="space-y-4">
              {PRODUCTS.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setSelectedProduct(product);
                    if (paymentStatus === 'success') setPaymentStatus('idle');
                  }}
                  className={`group relative p-8 rounded-[32px] border transition-all duration-500 cursor-pointer ${
                    selectedProduct.id === product.id
                      ? 'border-black bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]'
                      : 'border-black/5 bg-transparent hover:border-black/20'
                  }`}
                >
                  {product.tag && (
                    <div className="absolute -top-3 right-8 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {product.tag}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-2xl font-bold transition-colors ${selectedProduct.id === product.id ? 'text-black' : 'text-black/40'}`}>
                          {product.name}
                        </h3>
                        {selectedProduct.id === product.id && (
                          <motion.div layoutId="check" className="text-indigo-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed transition-colors max-w-md ${selectedProduct.id === product.id ? 'text-black/60' : 'text-black/30'}`}>
                        {product.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold tracking-tight mb-1 ${selectedProduct.id === product.id ? 'text-black' : 'text-black/30'}`}>
                        ${product.price}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-black/30">
                        USD / One-time
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-3xl bg-black/5 border border-black/5 flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Info className="w-5 h-5 text-black/40" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Need a custom solution?</h4>
                <p className="text-sm text-black/50 leading-relaxed">
                  For teams larger than 50 or specialized requirements, contact our sales team for a tailored quote and dedicated support.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-black/5"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold tracking-tight">Summary</h2>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-black/30">
                  <Lock className="w-3 h-3" />
                  Encrypted
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1">Selected Plan</div>
                    <div className="font-bold text-lg">{selectedProduct.name}</div>
                  </div>
                  <div className="font-bold text-lg">${selectedProduct.price}</div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-1">Processing Fee</div>
                    <div className="font-bold text-lg">Included</div>
                  </div>
                  <div className="font-bold text-lg">$0.00</div>
                </div>

                <div className="h-px bg-black/5" />

                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold tracking-tighter">Total</span>
                  <div className="text-right">
                    <span className="text-4xl font-bold tracking-tighter text-indigo-600">${selectedProduct.price}</span>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-black/30 mt-1">All taxes included</div>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {paymentStatus === 'idle' || paymentStatus === 'processing' ? (
                  <motion.div
                    key="paypal-container"
                    initial={{ opacity: 0, y: 10 }}
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
                    <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-black/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Powered by PayPal Secure
                    </div>
                  </motion.div>
                ) : paymentStatus === 'success' ? (
                  <motion.div
                    key="success-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight mb-3">Payment Confirmed</h3>
                    <p className="text-black/50 text-sm mb-8 leading-relaxed">
                      Your transaction was successful. Order ID: <br />
                      <span className="font-mono text-indigo-600 font-bold mt-2 inline-block">{orderId}</span>
                    </p>
                    <button
                      onClick={() => setPaymentStatus('idle')}
                      className="w-full py-5 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-all flex items-center justify-center gap-3"
                    >
                      Return to Dashboard <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="error-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight mb-3">Transaction Failed</h3>
                    <p className="text-black/50 text-sm mb-8 leading-relaxed">
                      We couldn't process your payment at this time. Please check your details and try again.
                    </p>
                    <button
                      onClick={() => setPaymentStatus('idle')}
                      className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-rose-700 transition-all"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 opacity-20 grayscale hover:opacity-40 transition-opacity duration-500">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-6" />
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  {authMode === 'login' ? 'Welcome back.' : 'Create account.'}
                </h2>
                <p className="text-black/50 text-sm">
                  {authMode === 'login' ? 'Enter your credentials to access your account.' : 'Join us to manage your payments and subscriptions.'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-sm font-medium"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-sm font-medium"
                  />
                </div>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-black/5 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all text-sm font-medium"
                  />
                </div>

                {authError && (
                  <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-all mt-4"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm">
                <span className="text-black/40">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                </span>
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="ml-2 font-bold text-indigo-600 hover:underline"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="border-t border-black/5 bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <CreditCard className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight uppercase italic">PayHub.</span>
              </div>
              <p className="text-black/40 text-sm max-w-xs leading-relaxed">
                Empowering digital commerce with secure, seamless payment experiences for businesses of all sizes.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-[11px] uppercase tracking-widest text-black/30 mb-6">Product</h5>
              <ul className="space-y-4 text-sm font-semibold">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-[11px] uppercase tracking-widest text-black/30 mb-6">Company</h5>
              <ul className="space-y-4 text-sm font-semibold">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-black/5 text-[11px] font-bold uppercase tracking-widest text-black/30">
            <p>© 2026 PayHub Global Systems. All rights reserved.</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
