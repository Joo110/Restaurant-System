import React, { useState } from 'react';
import { sendResetCode, resendResetCode } from '../services/passwordService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setMsg(null);
    setError(null);
    try {
      await sendResetCode(email);
      setMsg('تم إرسال كود إعادة التعيين إلى البريد');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل إرسال الكود');
    }
  };

  const handleResend = async () => {
    setMsg(null);
    setError(null);
    try {
      await resendResetCode(email);
      setMsg('تم إعادة إرسال الكود');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل إعادة الإرسال');
    }
  };

  return (
    <div
      style={{ backgroundColor: '#1a73e8' }}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-md w-full">
        {/* White Card */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
        >
          {/* Header */}
          <div className="p-6 sm:p-8 text-center border-b" style={{ borderColor: '#e5e7eb' }}>
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
              style={{ backgroundColor: '#1a73e8' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">نسيت كلمة المرور</h2>
            <p className="text-gray-500 text-sm">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 border rounded-md transition-all"
                  style={{ borderColor: '#d0d0d0' }}
                  onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = '#1a73e8')}
                  onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = '#d0d0d0')}
                >
                  <svg className="w-5 h-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chef@restaurant.com"
                    className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Success Message */}
              {msg && (
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-md px-3 py-2.5">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-600 text-sm">{msg}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2.5">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSend}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-white font-semibold text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1a73e8' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  إرسال الكود
                </button>
                <button
                  onClick={handleResend}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm transition-all hover:bg-gray-100 border"
                  style={{ borderColor: '#d0d0d0', color: '#555' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  إعادة إرسال
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-1">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                  style={{ color: '#1a73e8' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  العودة إلى تسجيل الدخول
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Logo */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-bold">Restaurant Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
}