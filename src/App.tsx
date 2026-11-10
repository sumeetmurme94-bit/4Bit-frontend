import React, { useState } from 'react';
import Header, { ActiveTab } from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { StaffRole } from './types/complaint';
import { INITIAL_COMPLAINTS } from './data/mockComplaints';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [selectedUnit, setSelectedUnit] = useState<string>(
    currentUser?.department || 'Sanitation & Maintenance'
  );

  // Derive role strictly from the authenticated session
  const currentRole: StaffRole = currentUser?.role || 'Ward Staff';

  // If not logged in, show LoginPage as the default entry route
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setActiveTab('tasks')} />;
  }

  // Calculate counts for badges
  const overdueCount = INITIAL_COMPLAINTS.filter(
    (c) => c.status === 'Escalated' || c.isOverdue
  ).length;

  const myTasksCount = INITIAL_COMPLAINTS.filter((c) => {
    if (currentRole === 'Ward Staff') {
      const staffName = currentUser?.name || 'Ramesh';
      const firstName = staffName.split(' ')[0];
      return (
        !!c.assignedStaff &&
        c.assignedStaff.toLowerCase().includes(firstName.toLowerCase()) &&
        c.status !== 'Resolved'
      );
    }
    if (currentRole === 'Department Head') {
      return c.assignedDepartment === selectedUnit && c.status !== 'Resolved';
    }
    return c.status !== 'Resolved';
  }).length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-stone-800 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Desktop & Mobile Header with Synchronized Profile Header State */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedUnit={selectedUnit}
        overdueCount={overdueCount}
        myTasksCount={myTasksCount}
        onLogout={() => {
          setActiveTab('tasks');
        }}
      />

      {/* 2. Main Content Area with defined min-h-[500px] to prevent layout jumping */}
      <main className="flex-1 w-full pt-20 sm:pt-24 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-y-auto min-h-[500px]">
        <DashboardPage
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedUnit={selectedUnit}
          onSelectUnit={setSelectedUnit}
        />
      </main>

      {/* 3. Mobile Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        onLogout={() => {
          logout();
          setActiveTab('tasks');
        }}
        overdueCount={overdueCount}
        myTasksCount={myTasksCount}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
