import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

type Tab = 'login' | 'signup' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onClose();
    navigate('/app');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    const { error: err } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: {
        data: {
          first_name: signupForm.firstName,
          last_name: signupForm.lastName,
        },
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess('Account created! Check your email to confirm, then log in.');
    setTab('login');
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/dashboard`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess('Password reset email sent! Check your inbox.');
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent transition-all';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#F5A623] via-[#E63946] to-[#F5A623]" />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-brand text-2xl text-gray-900">
                    {tab === 'forgot' ? 'Reset Password' : tab === 'login' ? 'Welcome Back' : 'Get Started'}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {tab === 'forgot'
                      ? "We'll send you a reset link"
                      : tab === 'login'
                      ? 'Sign in to your Season Content account'
                      : 'Create your account and start filming'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tab switcher (login/signup) */}
              {tab !== 'forgot' && (
                <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
                  {(['login', 'signup'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); clearMessages(); }}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm">
                  {success}
                </div>
              )}

              {/* Login form */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    className={inputClass}
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className={inputClass}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); clearMessages(); }}
                    className="text-sm text-[#F5A623] hover:underline"
                  >
                    Forgot my password
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-[#F5A623] hover:text-black transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* Signup form */}
              {tab === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      className={inputClass}
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      className={inputClass}
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className={inputClass}
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password (min 8 characters)"
                    minLength={8}
                    className={inputClass}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-[#F5A623] hover:text-black transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}

              {/* Forgot password form */}
              {tab === 'forgot' && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className={inputClass}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-[#F5A623] hover:text-black transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab('login'); clearMessages(); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Back to login
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
