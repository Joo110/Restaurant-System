import React, { useState } from 'react';
import { useMyData } from '../hooks/useUser';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ProfilePage() {
  const { data, update } = useMyData();
  const [form, setForm] = useState({ name: data?.name ?? '', email: data?.email ?? '', phone: data?.phone ?? '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    try {
      await update(form);
      setMsg('تم تحديث البيانات بنجاح');
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل التحديث');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-2 text-center sm:text-right">
            الملف الشخصي
          </h1>
          <p className="text-slate-600 text-base sm:text-lg text-center sm:text-right">
            إدارة بياناتك الشخصية ومعلومات حسابك
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl sm:rounded-3xl border-2 border-orange-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-white shadow-2xl flex items-center justify-center">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-600">
                  {data?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-center sm:text-right text-white flex-1">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">{data?.name || 'المستخدم'}</h2>
                <p className="text-orange-100 text-sm sm:text-base lg:text-lg">{data?.email || 'لا يوجد بريد إلكتروني'}</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
              {/* Name Field */}
              <div>
                <label className="text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  الاسم
                </label>
                <input
                  name="name"
                  placeholder="أدخل اسمك الكامل"
                  className="w-full p-3 sm:p-4 border-2 border-orange-200 focus:border-orange-500 rounded-xl lg:rounded-2xl text-slate-800 bg-orange-50/30 focus:bg-white transition-all text-sm sm:text-base focus:outline-none focus:shadow-lg focus:shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  البريد الإلكتروني
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="example@restaurant.com"
                  className="w-full p-3 sm:p-4 border-2 border-orange-200 focus:border-orange-500 rounded-xl lg:rounded-2xl text-slate-800 bg-orange-50/30 focus:bg-white transition-all text-sm sm:text-base focus:outline-none focus:shadow-lg focus:shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  رقم الهاتف
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  className="w-full p-3 sm:p-4 border-2 border-orange-200 focus:border-orange-500 rounded-xl lg:rounded-2xl text-slate-800 bg-orange-50/30 focus:bg-white transition-all text-sm sm:text-base focus:outline-none focus:shadow-lg focus:shadow-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Success Message */}
              {msg && (
                <div className="bg-emerald-100 border-2 border-emerald-300 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-emerald-700 font-semibold text-sm sm:text-base">{msg}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-semibold text-sm sm:text-base">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل البيانات
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        حفظ التغييرات
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setForm({ name: data?.name ?? '', email: data?.email ?? '', phone: data?.phone ?? '' });
                        setMsg(null);
                        setError(null);
                      }}
                      className="flex-1 py-3 sm:py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base lg:text-lg rounded-xl lg:rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        إلغاء
                      </span>
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-orange-100 p-5 sm:p-6 shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">حساب آمن</h3>
                <p className="text-slate-600 text-xs sm:text-sm">بياناتك محمية بالكامل</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-orange-100 p-5 sm:p-6 shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">حساب مفعل</h3>
                <p className="text-slate-600 text-xs sm:text-sm">يمكنك الوصول لكل المميزات</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}