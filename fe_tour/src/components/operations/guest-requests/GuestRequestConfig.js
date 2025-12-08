import { Utensils, Stethoscope, Accessibility, Bed, HelpCircle, AlertOctagon, AlertTriangle, Info, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const REQUEST_TYPES = {
    dietary: { label: 'Ăn uống', icon: Utensils, color: 'text-green-600 bg-green-50 border-green-200' },
    medical: { label: 'Y tế', icon: Stethoscope, color: 'text-red-600 bg-red-50 border-red-200' },
    accessibility: { label: 'Hỗ trợ di chuyển', icon: Accessibility, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    room: { label: 'Phòng ốc', icon: Bed, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    other: { label: 'Khác', icon: HelpCircle, color: 'text-slate-600 bg-slate-50 border-slate-200' }
};

export const PRIORITIES = {
    critical: { label: 'Khẩn cấp', icon: AlertOctagon, color: 'text-red-700 bg-red-100 border-red-300 ring-2 ring-red-500' },
    high: { label: 'Cao', icon: AlertTriangle, color: 'text-orange-700 bg-orange-100 border-orange-300' },
    medium: { label: 'Trung bình', icon: Info, color: 'text-blue-700 bg-blue-100 border-blue-300' },
    low: { label: 'Thấp', icon: Info, color: 'text-slate-600 bg-slate-100 border-slate-300' }
};

export const STATUSES = {
    pending: { label: 'Chờ xử lý', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    acknowledged: { label: 'Đã tiếp nhận', icon: Info, color: 'bg-blue-100 text-blue-800' },
    fulfilled: { label: 'Đã đáp ứng', icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
    cannot_fulfill: { label: 'Không thể đáp ứng', icon: XCircle, color: 'bg-slate-100 text-slate-500 line-through' }
};