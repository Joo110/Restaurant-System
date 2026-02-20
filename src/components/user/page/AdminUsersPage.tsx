// src/components/user/page/AdminUsersPage.tsx
import { useEffect, useState, type ReactElement } from 'react';
import { useAdminDashboard } from '../hooks/useAdmin';
import type { User } from '../types/user';

export default function AdminUsersPage(): ReactElement {
  const { data, loading, fetch, updateRole, deactivate, activate } = useAdminDashboard();
  const [page] = useState<number>(1);

  useEffect(() => {
    fetch({ page }).catch(() => {});
  }, [page]);

  const handleRefresh = () => fetch({ page }).catch(() => {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="text-center sm:text-right">
              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-2">
                إدارة المستخدمين
              </h1>
              <p className="text-slate-600 text-base sm:text-lg">
                إدارة وتنظيم حسابات المستخدمين والصلاحيات
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <div className="bg-white px-5 sm:px-6 py-3 rounded-xl sm:rounded-xl shadow-md border-2 border-orange-200/50">
                <div className="text-xs sm:text-sm text-slate-600 font-medium">إجمالي المستخدمين</div>
                <div className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                  {data?.data?.length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden backdrop-blur-sm bg-white/95">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 px-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-amber-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
              </div>
              <p className="mt-6 text-slate-600 text-base sm:text-lg font-medium">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="block lg:hidden divide-y divide-orange-100">
                {data?.data && data.data.length > 0 ? (
                  data.data.map((u: User, index: number) => (
                    <div 
                      key={u._id} 
                      className="p-4 sm:p-5 hover:bg-orange-50/50 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* User Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 text-lg sm:text-xl mb-1 truncate">{u.name}</div>
                          <div className="text-sm sm:text-base text-slate-600 mb-1 truncate">
                            {u.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="truncate">{u.phone || '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status & Role */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
                          u.active 
                            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' 
                            : 'bg-rose-100 text-rose-700 ring-2 ring-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                          {u.active ? 'مفعّل' : 'معطّل'}
                        </span>
                        
                        {u.role === 'admin' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-amber-100 text-amber-700 ring-2 ring-amber-200">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            مسؤول
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => updateRole(u._id ?? '', u.role === 'admin' ? 'user' : 'admin')}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                        >
                          <span className="flex items-center justify-center gap-2 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            تبديل الدور
                          </span>
                        </button>

                        {u.active ? (
                          <button
                            onClick={() => deactivate(u._id ?? '').then(handleRefresh).catch(() => {})}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                          >
                            <span className="flex items-center justify-center gap-2 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              تعطيل
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => activate(u._id ?? '').then(handleRefresh).catch(() => {})}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                          >
                            <span className="flex items-center justify-center gap-2 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              تفعيل
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 px-4">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-slate-600 mb-2">لا توجد بيانات</p>
                      <p className="text-sm sm:text-base text-slate-500 text-center">لم يتم العثور على أي مستخدمين في النظام</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-200">
                      <th className="px-6 py-5 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          الاسم
                        </div>
                      </th>
                      <th className="px-6 py-5 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          البريد الإلكتروني
                        </div>
                      </th>
                      <th className="px-6 py-5 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          رقم الهاتف
                        </div>
                      </th>
                      <th className="px-6 py-5 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          الحالة
                        </div>
                      </th>
                      <th className="px-6 py-5 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          الإجراءات
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {data?.data && data.data.length > 0 ? (
                      data.data.map((u: User, index: number) => (
                        <tr 
                          key={u._id} 
                          className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-200 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                                {u.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 text-base">{u.name}</div>
                                <div className="text-sm text-slate-500">
                                  {u.role === 'admin' ? (
                                    <span className="inline-flex items-center gap-1">
                                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      مسؤول
                                    </span>
                                  ) : (
                                    'مستخدم'
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="font-medium">{u.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-slate-700 font-medium direction-ltr">
                              {u.phone || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                              u.active 
                                ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' 
                                : 'bg-rose-100 text-rose-700 ring-2 ring-rose-200'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></span>
                              {u.active ? 'مفعّل' : 'معطّل'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateRole(u._id ?? '', u.role === 'admin' ? 'user' : 'admin')}
                                className="group/btn relative px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                              >
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                  تبديل الدور
                                </span>
                              </button>

                              {u.active ? (
                                <button
                                  onClick={() => deactivate(u._id ?? '').then(handleRefresh).catch(() => {})}
                                  className="group/btn relative px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                                >
                                  <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    تعطيل
                                  </span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => activate(u._id ?? '').then(handleRefresh).catch(() => {})}
                                  className="group/btn relative px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                                >
                                  <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    تفعيل
                                  </span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
                              <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <p className="text-xl font-semibold text-slate-600 mb-2">لا توجد بيانات</p>
                            <p className="text-slate-500">لم يتم العثور على أي مستخدمين في النظام</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}