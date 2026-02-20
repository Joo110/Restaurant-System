// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import LoginPage from './components/user/page/LoginPage';
import SignUpPage from './components/user/page/SignUpPage';
import ForgotPasswordPage from './components/user/page/ForgetPasswordPage';
import ProfilePage from './components/user/page/ProfilePage';
import AdminUsersPage from './components/user/page/AdminUsersPage';

import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './components/dashboard/page/Dashboard';

import MenuManagement, { type MenuItem } from './components/Menu/page/MenuManagement';
import AddMenuItemModal from './components/Menu/page/AddMenuItemModal';
import EditMenuItemModal from './components/Menu/page/EditMenuItemModal';

import OrdersManagement from './components/Order/page/OrdersManagement';
import EditOrder from './components/Order/page/EditOrder';
import CreateOrder from './components/Order/page/CreateOrder';

import InventoryPage from './components/Inventorys/page/InventoryPage';
import StockDetailPage from './components/Inventorys/page/StockDetailPage';
import SupplierManagement from './components/Supplier/page/Suppliermanagement';

import StaffPage from './components/Inventorys/page/Staffpage';
import EditEmployeeModal from './components/Inventorys/page/Editemployeemodal';
import EmployeeProfilePage from './components/Employess/page/EmployeeProfilePage';

import AttendancePage from './components/Employess/page/AttendancePage';
import EmployeeAttendanceDetail from './components/Employess/page/EmployeeAttendanceDetail';

import PayrollPage from './components/payroll/page/PayrollPage';
import EmployeePayrollDetail from './components/payroll/page/EmployeePayrollDetail';

import './App.css';

// ─── Private Route Guard ───────────────────────────────────────────────────────
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = Cookies.get('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Menu Page Wrapper ─────────────────────────────────────────────────────────
const MenuPage: React.FC = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  return (
    <>
      <MenuManagement
        onAddItem={() => setShowAdd(true)}
        onEditItem={(item) => setEditItem(item)}
      />
      <AddMenuItemModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(newItem) => {
          console.log('New item added:', newItem);
          setShowAdd(false);
        }}
      />
      <EditMenuItemModal
        isOpen={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={(updated) => {
          console.log('Item updated:', updated);
          setEditItem(null);
        }}
      />
    </>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Dashboard (Protected + Nested) ── */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* /dashboard */}
          <Route index element={<DashboardPage />} />

          {/* ── Menu ── */}
          <Route path="menu" element={<MenuPage />} />

          {/* ── Orders ── */}
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="orders/create" element={<CreateOrder />} />
          <Route path="orders/:id/edit" element={<EditOrder />} />

          {/* ── Inventory ── */}
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/:id" element={<StockDetailPage />} />

          {/* ── Suppliers ── */}
          <Route path="suppliers" element={<SupplierManagement />} />

          {/* ── Staff ── */}
          <Route path="staff" element={<StaffPage />} />
          <Route path="staff/:id" element={<EmployeeProfilePage />} />
          <Route path="staff/:id/edit" element={<EditEmployeeModal />} />

          {/* ── Attendance ── */}
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="staff/:id/attendance" element={<EmployeeAttendanceDetail />} />

          {/* ── Payroll ── */}
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="payroll/:id" element={<EmployeePayrollDetail />} />
        </Route>

        {/* ── Other Protected Top-Level Pages ── */}
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><AdminUsersPage /></PrivateRoute>} />

        {/* ── Root & Fallback ── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}