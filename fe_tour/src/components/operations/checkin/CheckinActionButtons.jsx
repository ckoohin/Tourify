import React, { useState } from 'react';
import { Check, X, Clock, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import checkinService from '../../../services/api/checkinService'; 

const CheckinActionButtons = ({ 
    checkinId, 
    currentStatus, 
    onSuccess 
}) => {
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            let location = null;
            if ("geolocation" in navigator) {
                try {
                    const pos = await new Promise((res, rej) => 
                        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
                    );
                    location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                } catch (e) {}
            }

            await checkinService.checkInGuest(checkinId, location);
            toast.success("Đã check-in");
            onSuccess();
        } catch (error) {
            toast.error("Lỗi check-in");
        } finally {
            setLoading(false);
        }
    };


    const handleExcuse = async () => {
        const reason = window.prompt("Nhập lý do vắng mặt (VD: Ốm, mệt...):");
        if (!reason) return;

        setLoading(true);
        try {
            await checkinService.markExcused(checkinId, reason);
            toast.success("Đã ghi nhận vắng có phép");
            onSuccess();
        } catch (error) {
            toast.error("Lỗi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if(!window.confirm("Bạn muốn hủy trạng thái điểm danh của khách này?")) return;
        toast("Tính năng đang phát triển", { icon: '🚧' });
    };

    if (loading) {
        return <Loader2 size={18} className="animate-spin text-slate-400" />;
    }

    if (currentStatus !== 'pending') {
        return (
            <div className="flex items-center gap-2">
                {currentStatus === 'checked_in' && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={14}/> Có mặt</span>}
                {currentStatus === 'auto_checked' && <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Check size={14}/> Auto</span>}
                {currentStatus === 'missed' && <span className="text-xs font-bold text-red-600 flex items-center gap-1"><X size={14}/> Vắng</span>}
                {currentStatus === 'excused' && <span className="text-xs font-bold text-orange-600 flex items-center gap-1"><Clock size={14}/> Có phép</span>}
                
                <button 
                    onClick={handleReset}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    title="Hoàn tác / Chỉnh sửa lại"
                >
                    <RotateCcw size={12} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <button 
                onClick={handleCheckIn}
                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all active:scale-95"
                title="Có mặt (Check-in)"
            >
                <Check size={18} strokeWidth={2.5} />
            </button>
            
            <button 
                onClick={handleExcuse}
                className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-all active:scale-95"
                title="Vắng có phép"
            >
                <Clock size={18} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default CheckinActionButtons;