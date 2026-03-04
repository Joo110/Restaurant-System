// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import LoginPage           from './components/user/page/LoginPage';
import SignUpPage          from './components/user/page/SignUpPage';
import ForgotPasswordPage  from './components/user/page/ForgetPasswordPage';
import ProfilePage         from './components/user/page/ProfilePage';
import AdminUsersPage      from './components/user/page/AdminUsersPage';

import DashboardLayout     from './components/layout/DashboardLayout';
import DashboardPage       from './components/dashboard/page/Dashboard';

import MenuManagement, { type MenuItem } from './components/Menu/page/MenuManagement';
import AddMenuItemModal    from './components/Menu/page/AddMenuItemModal';
import EditMenuItemModal   from './components/Menu/page/EditMenuItemModal';

import OrdersManagement    from './components/Order/page/OrdersManagement';
import EditOrder           from './components/Order/page/EditOrder';
import CreateOrder         from './components/Order/page/CreateOrder';

import InventoryPage       from './components/Inventorys/page/InventoryPage';
import StockDetailPage     from './components/Inventorys/page/StockDetailPage';
import SupplierManagement  from './components/Supplier/page/Suppliermanagement';

import StaffPage           from './components/Employess/page/Staffpage';
import EditEmployeeModal   from './components/Inventorys/page/Editemployeemodal';
import EmployeeProfilePage from './components/Employess/page/EmployeeProfilePage';

import AttendancePage           from './components/Employess/page/AttendancePage';
import EmployeeAttendanceDetail from './components/Employess/page/EmployeeAttendanceDetail';

import PayrollPage           from './components/payroll/page/PayrollPage';
import EmployeePayrollDetail from './components/payroll/page/EmployeePayrollDetail';

import BranchesOverview   from './components/branches/page/Branchesoverview';
import BranchReports      from './components/branches/page/Branchreports';
import Executivedashboard from './components/branches/page/Executivedashboard';

import FinanceOverview   from './components/Finance/page/FinanceOverview';
import NotificationsPage from './components/Notifications/page/Notificationspage';
import TablesPage        from './components/Tables/page/Tablespage';

// ── Dispatch ──────────────────────────────────────────────────────────────────
import DispatchManagement       from './components/DeliveryandDispatch/page/DispatchManagement';
import RiderShiftSettlement     from './components/DeliveryandDispatch/page/RiderShiftSettlement';
import OrderDetailsPage         from './components/DeliveryandDispatch/page/OrderDetailsPage';
import OrdersManagementDelivery from './components/DeliveryandDispatch/page/OrdersManagementDelivery';

import './App.css';

// ─── Private Route Guard ───────────────────────────────────────────────────────
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = Cookies.get('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Menu Page Wrapper ─────────────────────────────────────────────────────────
const MenuPage: React.FC = () => {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  return (
    <>
      <MenuManagement
        onAddItem={() => setShowAdd(true)}
        onEditItem={(item: MenuItem) => setEditItem(item)}
      />

      {/* render AddMenuItemModal only when open (project's modal props don't include `isOpen`) */}
      {showAdd && (
        <AddMenuItemModal
          onClose={() => setShowAdd(false)}
          /* If your AddMenuItemModal supports a callback after add,
             you can add it here with the proper prop name; omitted to match actual props. */
          /* Example if it supported onAdded: onAdded={(newItem: MenuItem) => { ... }} */
        />
      )}

      {/* Edit modal: pass `onSaved` (not onSave) and type the parameter */}
      {editItem && (
        <EditMenuItemModal
          isOpen={true}
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={(updated: MenuItem) => { console.log('Item updated:', updated); setEditItem(null); }}
        />
      )}
    </>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/login"           element={<LoginPage />}          />
        <Route path="/signup"          element={<SignUpPage />}         />
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
          {/* Index */}
          <Route index element={<DashboardPage />} />

          {/* Menu */}
          <Route path="menu" element={<MenuPage />} />

          {/* Orders */}
          <Route path="orders"          element={<OrdersManagement />} />
          <Route path="orders/create"   element={<CreateOrder />}      />
          <Route path="orders/:id/edit" element={<EditOrder />}        />

          {/* ── Dispatch ── */}
          <Route path="dispatch"                 element={<DispatchManagement />}       />
          <Route path="dispatch/rider-shift"     element={<RiderShiftSettlement />}     />
          <Route path="dispatch/order/:id"       element={<OrderDetailsPage />}         />
          <Route path="dispatch/new-order"       element={<OrdersManagementDelivery />} />

          {/* Inventory */}
          <Route path="inventory"     element={<InventoryPage />}   />
          <Route path="inventory/:id" element={<StockDetailPage />} />

          {/* Suppliers */}
          <Route path="suppliers" element={<SupplierManagement />} />

          {/* Staff */}
          <Route path="staff"          element={<StaffPage />}           />
          <Route path="staff/:id"      element={<EmployeeProfilePage />} />
          <Route path="staff/:id/edit" element={<EditEmployeeModal />}   />

          {/* Attendance */}
          <Route path="attendance"           element={<AttendancePage />}           />
          <Route path="staff/:id/attendance" element={<EmployeeAttendanceDetail />} />

          {/* Payroll */}
          <Route path="payroll"     element={<PayrollPage />}           />
          <Route path="payroll/:id" element={<EmployeePayrollDetail />} />

          {/* Branches & Reports */}
          <Route path="branches"           element={<BranchesOverview />}  />
          <Route path="reports"            element={<BranchReports />}      />
          <Route path="Executivedashboard" element={<Executivedashboard />} />

          {/* Finance / Notifications / Tables */}
          <Route path="finance"       element={<FinanceOverview />}   />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="tables"        element={<TablesPage />}        />

        </Route>

        {/* Other Protected */}
        <Route path="/profile"     element={<PrivateRoute><ProfilePage /></PrivateRoute>}    />
        <Route path="/admin/users" element={<PrivateRoute><AdminUsersPage /></PrivateRoute>} />

        {/* Root & Fallback */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/"          replace />} />

      </Routes>
    </BrowserRouter>
  );
}