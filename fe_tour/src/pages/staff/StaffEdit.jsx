import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, User, Calendar, Briefcase } from 'lucide-react';
import staffService from '../../services/api/staffService';

import StaffForm from '../../components/staff/StaffForm';
import StaffSchedule from '../../components/staff/StaffSchedule';

const StaffEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);
  const [stats, setStats] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await staffService.getById(id);
        if (res.success) {
          setStaffData(res.data.staff);
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        alert("Không tìm thấy nhân viên");
        navigate('/guides');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>;
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Header Nav */}
      <button 
        onClick={() => navigate('/staff')} 
        className="flex items-center text-slate-500 hover:text-slate-800 mb-4 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-1"/> Quay lại danh sách
      </button>

      {/* Header Title & Code */}
      <div className="flex justify-between items-end mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
             {staffData.full_name} 
             <span className="text-sm font-normal text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                #{staffData.staff_code}
             </span>
           </h1>
           <p className="text-slate-500 text-sm mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1"><Briefcase size={14}/> {staffData.staff_type.toUpperCase()}</span>
              <span className="flex items-center gap-1"><User size={14}/> {staffData.phone}</span>
           </p>
        </div>
        
        {/* Mini Stats */}
        <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 uppercase font-bold">Tổng Tour</p>
              <p className="text-xl font-bold text-blue-600">{stats?.total_tours || 0}</p>
           </div>
           <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center">
              <p className="text-xs text-slate-500 uppercase font-bold">Đánh giá</p>
              <p className="text-xl font-bold text-yellow-500">{stats?.avg_rating || '0.0'}</p>
           </div>
        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <StaffForm 
             staffId={id} 
             initialData={staffData} 
             onSuccess={() => alert("Cập nhật hồ sơ thành công!")}
           />
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="h-[600px]">
              <StaffSchedule staffId={id} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default StaffEdit;