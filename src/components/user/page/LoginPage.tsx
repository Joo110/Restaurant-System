import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { logIn, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await logIn(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div
      style={{ backgroundColor: '#1a73e8' }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      {/* White Card */}
      <div
        className="bg-white rounded-2xl flex flex-col lg:flex-row overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '780px',
          minHeight: '420px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* ===== Left: Form ===== */}
        <div className="flex-1 p-10 flex flex-col justify-center gap-5">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1a73e8' }}>
              Login
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              welcome Back to ***** .please enter your email and password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-md"
              style={{
                border: `1px solid ${focusedField === 'email' ? '#1a73e8' : '#d0d0d0'}`,
                boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(26,115,232,0.15)' : 'none',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#888' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="Email"
                required
                className="w-full text-sm outline-none text-gray-700 bg-transparent placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-md"
              style={{
                border: `1px solid ${focusedField === 'password' ? '#1a73e8' : '#d0d0d0'}`,
                boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(26,115,232,0.15)' : 'none',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#888' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Password"
                required
                className="w-full text-sm outline-none text-gray-700 bg-transparent placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Forgot Password */}
            <a href="#" className="text-sm text-gray-500 hover:underline w-fit">
              forgot password ?
            </a>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#1a73e8' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* ===== Right: Logo ===== */}
        <div
          className="hidden lg:flex items-center justify-center m-8 rounded-xl flex-shrink-0"
          style={{ width: '240px', backgroundColor: '#d4d4d4' }}
        >
          <span className="font-semibold tracking-widest" style={{ color: '#999', fontSize: '22px' }}>
            LOGO
          </span>
        </div>
      </div>
    </div>
  );
}