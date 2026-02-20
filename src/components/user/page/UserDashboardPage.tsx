import React from 'react';
import { useMyData } from '../hooks/useUser';

export default function DashboardPage() {
  const { data, loading } = useMyData();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#f0f4ff' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-center sm:text-right"
            style={{ color: '#1a73e8' }}
          >
            لوحة التحكم
          </h1>
          <p className="text-gray-500 text-base sm:text-lg text-center sm:text-right">
            مرحباً بك في نظام إدارة المطعم
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 lg:py-40">
            <div className="relative">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"
              />
            </div>
            <p className="mt-6 text-gray-500 text-lg sm:text-xl font-medium">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Welcome Card */}
            <div
              className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white overflow-hidden relative"
              style={{ backgroundColor: '#1a73e8', boxShadow: '0 8px 32px rgba(26,115,232,0.3)' }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

              <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-white shadow-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ color: '#1a73e8' }}>
                    {data?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-center sm:text-right flex-1">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                    مرحباً، {data?.name || 'المستخدم'}!
                  </h2>
                  <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                    يسعدنا رؤيتك مجدداً في لوحة التحكم
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Name Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: '#1a73e8' }}
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">الاسم</h3>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: '#1a73e8' }}>
                  {data?.name || '—'}
                </p>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: '#1a73e8' }}
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">البريد الإلكتروني</h3>
                </div>
                <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-600 truncate">
                  {data?.email || '—'}
                </p>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: '#1a73e8' }}
                  >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">رقم الهاتف</h3>
                </div>
                <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-600 truncate direction-ltr text-right">
                  {data?.phone || '—'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md border border-gray-100">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1a73e8' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                الإجراءات السريعة
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <a
                  href="/profile"
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 group hover:shadow-md"
                  style={{ backgroundColor: '#f0f4ff', borderColor: '#c5d8ff' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#1a73e8')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#c5d8ff')}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#1a73e8' }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">الملف الشخصي</span>
                </a>

                <a
                  href="/settings"
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 group hover:shadow-md"
                  style={{ backgroundColor: '#f0f4ff', borderColor: '#c5d8ff' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#1a73e8')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#c5d8ff')}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#1a73e8' }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">الإعدادات</span>
                </a>

                <a
                  href="/orders"
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 group hover:shadow-md sm:col-span-2 lg:col-span-1"
                  style={{ backgroundColor: '#f0f4ff', borderColor: '#c5d8ff' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#1a73e8')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#c5d8ff')}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: '#1a73e8' }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">الطلبات</span>
                </a>
              </div>
            </div>

            {/* Restaurant Features */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div
                className="rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white"
                style={{ backgroundColor: '#1a73e8', boxShadow: '0 4px 20px rgba(26,115,232,0.25)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold">إدارة القائمة</h4>
                </div>
                <p className="text-blue-100 text-sm sm:text-base">تحكم كامل في عناصر القائمة والأسعار</p>
              </div>

              <div
                className="rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white"
                style={{ backgroundColor: '#1558b0', boxShadow: '0 4px 20px rgba(21,88,176,0.25)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold">التقارير والإحصائيات</h4>
                </div>
                <p className="text-blue-100 text-sm sm:text-base">تتبع الأداء والمبيعات بشكل دقيق</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}