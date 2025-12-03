import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Bus, Receipt, FileText, UserCog } from 'lucide-react';
import departureService from '../../services/api/departureService';
import GuestList from '../../components/operations/GuestList'; 
import ServiceList from '../booking/service/ServiceList'; 
import ExpenseList from '../../components/operations/ExpenseList'; 
// import TourLogList from '../../components/operations/logs/TourLogList';
import StaffAssignmentManager from '../../components/operations/staff/StaffAssignmentManager';

const DepartureDetail = () => {
  const { id } = useParams();
  const [departure, setDeparture] = useState(null);
  const [activeTab, setActiveTab] = useState('guests');

  useEffect(() => {
    const loadData = async () => {
        try {
            const res = await departureService.getById(id);
            if (res.success) setDeparture(res.data);
        } catch (e) { console.error(e); }
    };
    loadData();
  }, [id]);

  if (!departure) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
         <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {departure.departure_code} - {departure.tour_name}
         </h1>
         <div className="flex gap-6 text-sm text-slate-600">
             <span>Ngày đi: <b>{new Date(departure.departure_date).toLocaleDateString('vi-VN')}</b></span>
             <span>Số khách: <b>{departure.confirmed_guests}/{departure.max_guests}</b></span>
             <span>Trạng thái: <b className="uppercase">{departure.status}</b></span>
         </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
          {[
              { id: 'guests', label: 'Danh sách Khách', icon: Users },
              { id: 'services', label: 'Dịch vụ', icon: Bus },
              { id: 'expenses', label: 'Chi phí & Quyết toán', icon: Receipt },
              { id: 'logs', label: 'Nhật ký Tour', icon: FileText },
              { id: 'staff', label: 'Nhân sự', icon: UserCog },
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600 bg-blue-50' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                  <tab.icon size={16}/> {tab.label}
              </button>
          ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
          {activeTab === 'guests' && <GuestList departureId={id} />}
          {activeTab === 'services' && <ServiceList departureId={id} />}
          {activeTab === 'logs' && <TourLogList departureId={id} />}
          {activeTab === 'staff' && (
            <StaffAssignmentManager 
                    departureId={id} 
                    assignments={departure.staff_assignments || []} 
                    onRefresh={fetchDepartureDetail} 
                    departureDates={{
                    start: departure.departure_date,
                    end: departure.return_date
                    }}
            />
        )}
          {activeTab === 'expenses' && <ExpenseList departureId={id} />}                                                            
          {/* Các tab khác tương tự */}
      </div>
    </div>
  );
};

export default DepartureDetail;