import React, { useEffect, useState } from 'react';
import { 
  Inbox, Loader2, CheckCircle2, Clock, AlertCircle, XCircle 
} from 'lucide-react';
import feedbackService from '../../services/api/feedbackService';

const StatCard = ({ title, count, icon: Icon, color, subStats }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className={`text-3xl font-bold mt-1 ${color}`}>{count}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
    {subStats && (
        <div className="pt-3 border-t border-slate-100 flex gap-3 text-xs text-slate-500">
            {subStats.map((sub, idx) => (
                <span key={idx} className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.color}`}></span>
                    {sub.label}: <b>{sub.value}</b>
                </span>
            ))}
        </div>
    )}
  </div>
);

const FeedbackStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await feedbackService.getStats();
        if (res.success && res.data.stats) {
            // Aggregate data from array of types
            const raw = res.data.stats;
            const total = raw.reduce((sum, item) => sum + item.total, 0);
            const open = raw.reduce((sum, item) => sum + Number(item.open_count), 0);
            const processing = raw.reduce((sum, item) => sum + Number(item.in_progress_count), 0);
            const resolved = raw.reduce((sum, item) => sum + Number(item.resolved_count), 0);
            const highPriority = raw.reduce((sum, item) => sum + Number(item.high_priority_count), 0);

            setStats({ total, open, processing, resolved, highPriority });
        }
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-slate-400"/></div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Tổng phản hồi" 
        count={stats.total} 
        icon={Inbox} 
        color="text-slate-700"
        subStats={[{label: 'Ưu tiên cao', value: stats.highPriority, color: 'bg-red-500'}]}
      />
      <StatCard 
        title="Chờ xử lý" 
        count={stats.open} 
        icon={AlertCircle} 
        color="text-orange-600" 
      />
      <StatCard 
        title="Đang xử lý" 
        count={stats.processing} 
        icon={Clock} 
        color="text-blue-600" 
      />
      <StatCard 
        title="Đã giải quyết" 
        count={stats.resolved} 
        icon={CheckCircle2} 
        color="text-emerald-600" 
      />
    </div>
  );
};

export default FeedbackStats;