import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertTriangle, ArrowLeft, Edit, Phone, Mail, User, MapPin, Calendar, CheckCheck } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import FullCalendar from '@fullcalendar/react'; // 
import dayGridPlugin from '@fullcalendar/daygrid';

export default function StaffDetail() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'schedule'

  // API 6: Lấy chi tiết (GET /api/v1/staff/:id?include=history,schedule)
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // BE cần trả về dữ liệu JOIN đầy đủ:
        // {
        //   ...staffInfo,
        //   assignments: [ ... (từ staff_assignments JOIN tours) ... ],
        //   schedule: [ ... (từ staff_schedules) ... ]
        // }
        
        // (Mock data)
        const mockData = {
          id: id, full_name: 'Nguyễn Văn An', staff_type: 'tour_guide', status: 'active',
          phone: '0901234567', email: 'an.nguyen@tourify.com', address: '123 Đội Cấn, Hà Nội',
          assignments: [
            { id: 1, departure_id: 1, tour_name: 'Hạ Long Du Thuyền 5 Sao', departure_date: '2025-11-20', role: 'tour_guide' },
            { id: 2, departure_id: 5, tour_name: 'Khám phá Tây Bắc', departure_date: '2025-10-15', role: 'tour_leader' }
          ],
          schedule: [
            { title: 'Tour HL032', start: '2025-11-20', end: '2025-11-22', backgroundColor: 'blue' },
            { title: 'Nghỉ phép', start: '2025-11-23', backgroundColor: 'gray' }
          ]
        };
        await new Promise(res => setTimeout(res, 500)); 
        
        setStaff(mockData);
      } catch (err) {
        setError('Không thể tải chi tiết nhân sự',err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) { /* ... Render Loading ... */ }
  if (error || !staff) { /* ... Render Error ... */ }

  const statusMap = {
    active: { level: 'success', text: 'Đang hoạt động' },
    inactive: { level: 'info', text: 'Không hoạt động' },
    on_leave: { level: 'warning', text: 'Đang nghỉ phép' },
  };
  const currentStatus = statusMap[staff.status] || statusMap.info;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link to="/guides" className="..."><ArrowLeft /> Quay lại</Link>
          <h1 className="text-3xl font-bold text-slate-800">{staff.full_name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge level={currentStatus.level} text={currentStatus.text} />
            <span className="text-sm font-medium text-slate-700 capitalize">
              Loại: {staff.staff_type.replace('_', ' ')}
            </span>
          </div>
        </div>
        <Link to={`/guides/edit/${id}`} className="..."><Edit /> Sửa</Link>
      </div>
      
      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái: Thông tin cá nhân */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-bold mb-5">Thông tin cá nhân</h3>
            <div className="space-y-4">
              <div className="flex">
                <Phone className="w-5 h-5 mr-3 text-slate-400..." />
                <div>
                  <div className="text-xs text-slate-500">Số điện thoại</div>
                  <a href={`tel:${staff.phone}`} className="font-medium text-primary ...">{staff.phone}</a>
                </div>
              </div>
              <div className="flex">
                <Mail className="w-5 h-5 mr-3 text-slate-400..." />
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <a href={`mailto:${staff.email}`} className="font-medium text-primary ...">{staff.email}</a>
                </div>
              </div>
              <div className="flex">
                <MapPin className="w-5 h-5 mr-3 text-slate-400..." />
                <div>
                  <div className="text-xs text-slate-500">Địa chỉ</div>
                  <div className="font-medium text-slate-700">{staff.address}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cột phải: Tabs Dữ liệu liên quan */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200">
            <button onClick={() => setActiveTab('history')} className={`... ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>
              <CheckCheck className="w-4 h-4" /> Lịch sử điều tour ({staff.assignments.length})
            </button>
            <button onClick={() => setActiveTab('schedule')} className={`... ${activeTab === 'schedule' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>
              <Calendar className="w-4 h-4" /> Lịch làm việc
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'history' && (
              <div className="space-y-4">
                {staff.assignments.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {staff.assignments.map(assign => (
                      <li key={assign.id} className="py-3">
                        <Link to={`/schedules/${assign.departure_id}`} className="font-medium text-slate-700 hover:text-primary ...">
                          {assign.tour_name}
                        </Link>
                        <div className="text-sm text-slate-500 mt-1">
                          Ngày đi: {assign.departure_date} (Vai trò: {assign.role})
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-center py-4">Nhân sự này chưa được điều tour nào.</p>
                )}
              </div>
            )}
            
            {activeTab === 'schedule' && (
              <div>
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  events={staff.schedule} // Dữ liệu từ API
                  locale="vi"
                  height="450px"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}