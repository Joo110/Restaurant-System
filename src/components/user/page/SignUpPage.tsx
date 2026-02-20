import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function SignUpPage() {
  const { signUp, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', passwordConfirmation: '', position: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* eslint-disable @typescript-eslint/no-explicit-any */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signUp(form);
      setSuccess('تم التسجيل بنجاح — تحقق من البريد الإلكتروني أو سجل دخولك');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء التسجيل');
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
          <div
            className="p-6 sm:p-8 text-center border-b"
            style={{ borderColor: '#e5e7eb' }}
          >
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
              style={{ backgroundColor: '#1a73e8' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">إنشاء حساب جديد</h2>
            <p className="text-gray-500 text-sm">انضم إلى نظام إدارة المطعم الآن</p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {success ? (
              <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-green-700 mb-1">تم التسجيل بنجاح!</h3>
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
                <a
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-md text-white font-semibold text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1a73e8' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  تسجيل الدخول
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم الكامل</label>
                  <input
                    name="name"
                    placeholder="أدخل اسمك الكامل"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border rounded-md text-gray-700 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#d0d0d0' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#1a73e8')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d0d0d0')}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="chef@restaurant.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border rounded-md text-gray-700 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#d0d0d0' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#1a73e8')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d0d0d0')}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border rounded-md text-gray-700 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#d0d0d0' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#1a73e8')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d0d0d0')}
                    required
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">المسمى الوظيفي</label>
                  <input
                    name="position"
                    placeholder="مدير، طاهي، موظف استقبال..."
                    value={form.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border rounded-md text-gray-700 placeholder-gray-400 outline-none transition-all"
                    style={{ borderColor: '#d0d0d0' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#1a73e8')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#d0d0d0')}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 border rounded-md transition-all"
                    style={{ borderColor: '#d0d0d0' }}
                    onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = '#1a73e8')}
                    onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = '#d0d0d0')}
                  >
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 border rounded-md transition-all"
                    style={{ borderColor: '#d0d0d0' }}
                    onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = '#1a73e8')}
                    onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderColor = '#d0d0d0')}
                  >
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="passwordConfirmation"
                      placeholder="••••••••"
                      value={form.passwordConfirmation}
                      onChange={handleChange}
                      className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? (
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
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-md text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ backgroundColor: '#1a73e8' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      سجل الآن
                    </>
                  )}
                </button>

                {/* Login link */}
                <p className="text-center text-gray-500 text-sm pt-1">
                  لديك حساب بالفعل؟{' '}
                  <a href="/login" className="font-semibold hover:underline" style={{ color: '#1a73e8' }}>
                    تسجيل الدخول
                  </a>
                </p>
              </form>
            )}
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