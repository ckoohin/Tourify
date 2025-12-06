import React, { useState } from 'react';
import { LayoutDashboard, ArrowRightLeft, Wallet, PieChart } from 'lucide-react';
import TransactionList from '../../components/financial/transactions/TransactionList';
import DebtList from '../../components/financial/debts/DebtList';
import ProfitReport from '../../components/financial/reports/ProfitReport';

const FinancialPage = () => {
  const [activeTab, setActiveTab] = useState('transactions');

  const tabs = [
    { id: 'transactions', label: 'Sổ Quỹ (Thu/Chi)', icon: ArrowRightLeft },
    { id: 'debts', label: 'Quản lý Công nợ', icon: Wallet },
    { id: 'reports', label: 'Báo cáo Lãi Lỗ', icon: PieChart },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Tài chính</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white px-4 rounded-t-xl shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 min-h-[500px]">
        {activeTab === 'transactions' && <TransactionList />}
        {activeTab === 'debts' && <DebtList />}
        {activeTab === 'reports' && <ProfitReport />}
      </div>
    </div>
  );
};

export default FinancialPage;