import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import tourExpenseService from '../../../services/api/tourExpenseService';
import BudgetComparison from './BudgetComparison';
import TourExpenseList from './TourExpenseList';
import TourExpenseForm from './TourExpenseForm';
import toast from 'react-hot-toast';

const TourExpenseManager = ({ departureId, isReadOnly = false }) => {
  const [expenses, setExpenses] = useState([]);
  const [budgetComparison, setBudgetComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expenseRes, budgetRes] = await Promise.all([
        tourExpenseService.getByDepartureId(departureId),
        tourExpenseService.compareWithBudget(departureId)
      ]);

      if (expenseRes.success) setExpenses(expenseRes.data || []);
      if (budgetRes.success) setBudgetComparison(budgetRes.data || null);

    } catch (error) {
      console.error("Lỗi tải dữ liệu chi phí:", error);
      toast.error("Không thể tải dữ liệu chi phí");
    } finally {
      setLoading(false);
    }
  }, [departureId]);

  useEffect(() => {
    if (departureId) fetchData();
  }, [fetchData, departureId]);

  const handleCreate = () => {
    setSelectedExpense(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedExpense(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khoản chi này?")) return;
    try {
      await tourExpenseService.delete(id);
      toast.success("Đã xóa khoản chi");
      fetchData();
    } catch (error) {
      toast.error("Lỗi xóa khoản chi");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Phần So sánh Ngân sách (Dashboard) */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={20}/> 
                Báo cáo Ngân sách & Thực tế
            </h3>
            <button onClick={fetchData} className="p-2 hover:bg-slate-100 rounded-full text-slate-500" title="Làm mới">
                <RefreshCw size={18}/>
            </button>
        </div>
        <BudgetComparison data={budgetComparison} loading={loading} />
      </section>

      <hr className="border-slate-200" />

      {/* 2. Phần Danh sách chi tiết */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-800">Chi tiết Khoản chi</h3>
            {!isReadOnly && (
                <button 
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18}/> Thêm Chi Phí
                </button>
            )}
        </div>

        <TourExpenseList 
            expenses={expenses} 
            loading={loading}
            onEdit={!isReadOnly ? handleEdit : null}
            onDelete={!isReadOnly ? handleDelete : null}
        />
      </section>

      {/* Modal Form */}
      <TourExpenseForm 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        initialData={selectedExpense}
        departureId={departureId}
        // Truyền danh mục từ budget xuống để gợi ý trong form
        budgetCategories={budgetComparison?.details?.map(d => d.category) || []}
      />
    </div>
  );
};

export default TourExpenseManager;