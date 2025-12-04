import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import departureService from '../../services/api/departureService';
import toast from 'react-hot-toast';

const RoomAssignmentModal = ({ isOpen, onClose, departureId, guest, onSuccess, allGuests }) => {
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Twin',
    roommate_id: '',
    notes: ''
  });

  useEffect(() => {
      if (guest) {
          setFormData({
            room_number: guest.room_number || '',
            room_type: guest.room_type || 'Twin',
            roommate_id: guest.roommate_id || '',
            notes: guest.notes || ''
          });
      }
  }, [guest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await departureService.assignRoom(departureId, guest.id, formData);
      toast.success('Cập nhật phòng thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Lỗi xếp phòng');
    }
  };

  if (!isOpen || !guest) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-lg text-slate-800">Xếp phòng: {guest.full_name}</h3>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số phòng</label>
            <input 
              type="text" 
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.room_number}
              onChange={e => setFormData({...formData, room_number: e.target.value})}
              placeholder="VD: 101, 205..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loại phòng</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.room_type}
                  onChange={e => setFormData({...formData, room_type: e.target.value})}
                >
                  <option value="Single">Single (Đơn)</option>
                  <option value="Double">Double (1 Giường lớn)</option>
                  <option value="Twin">Twin (2 Giường đơn)</option>
                  <option value="Triple">Triple (3 người)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Người cùng phòng</label>
                <select 
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.roommate_id}
                  onChange={e => setFormData({...formData, roommate_id: e.target.value})}
                >
                  <option value="">-- Chọn --</option>
                  {allGuests
                    .filter(g => g.id !== guest.id) // Loại bỏ chính mình
                    .map(g => (
                      <option key={g.id} value={g.id}>{g.full_name}</option>
                  ))}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú phòng</label>
            <textarea 
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="VD: Cần kê thêm giường phụ..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2">
              <Save size={16}/> Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomAssignmentModal;