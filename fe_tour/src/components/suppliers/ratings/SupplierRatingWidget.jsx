import React, { useState, useEffect } from 'react';
import supplierRatingService from '../../../services/api/supplierRatingService';
import StarRating from '../../common/StarRating';
import { User, Calendar } from 'lucide-react';

const SupplierRatingWidget = ({ supplierId }) => {
  const [stats, setStats] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchData();
  }, [supplierId, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        supplierRatingService.getStats(supplierId),
        supplierRatingService.getBySupplier(supplierId, { page, limit: 5 })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data.stats);
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data); // data là mảng ratings
        setPagination({
            page: reviewsRes.data.page,
            total: reviewsRes.data.total,
            limit: reviewsRes.data.limit
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tính điểm trung bình tổng
  const overallStat = stats.find(s => s.rating_type === 'overall') || { avg_rating: 0, total_ratings: 0 };
  const avgRating = Number(overallStat.avg_rating).toFixed(1);

  // Helper mapping tên
  const TYPE_MAP = {
      'service_quality': 'Chất lượng',
      'punctuality': 'Đúng giờ',
      'communication': 'Thái độ',
      'value': 'Giá trị',
      'overall': 'Tổng quan'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cột trái: Thống kê */}
      <div className="lg:col-span-1 space-y-6">
        {/* Điểm tổng */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <h4 className="text-slate-500 font-medium mb-2">Đánh giá tổng thể</h4>
            <div className="text-5xl font-black text-slate-800 mb-2">{avgRating}</div>
            <div className="flex justify-center mb-2">
                <StarRating rating={Number(avgRating)} size={24} />
            </div>
            <p className="text-sm text-slate-400">{overallStat.total_ratings} lượt đánh giá</p>
        </div>

        {/* Chi tiết theo tiêu chí */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Theo tiêu chí</h4>
            <div className="space-y-4">
                {stats.filter(s => s.rating_type !== 'overall').map((stat) => (
                    <div key={stat.rating_type}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">{TYPE_MAP[stat.rating_type] || stat.rating_type}</span>
                            <span className="font-bold text-slate-800">{Number(stat.avg_rating).toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-yellow-400 rounded-full" 
                                style={{ width: `${(stat.avg_rating / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Cột phải: Danh sách Review */}
      <div className="lg:col-span-2">
        <h4 className="font-bold text-lg text-slate-800 mb-4">Nhận xét mới nhất</h4>
        
        {loading ? (
            <div className="text-center py-10 text-slate-400">Đang tải...</div>
        ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-slate-500">
                Chưa có đánh giá nào.
            </div>
        ) : (
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User size={20}/>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm">{review.rater_name}</h5>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar size={12}/> {new Date(review.rated_at).toLocaleDateString('vi-VN')}
                                        {review.tour_code && <span className="text-blue-500">• {review.tour_code}</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <StarRating rating={Number(review.rating)} size={14} />
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded mt-1 text-slate-500 uppercase font-bold">
                                    {TYPE_MAP[review.rating_type]}
                                </span>
                            </div>
                        </div>
                        {review.comment && (
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic border border-slate-100">
                                "{review.comment}"
                            </p>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* Pagination Simple */}
        {pagination.total > pagination.limit && (
            <div className="flex justify-center mt-6 gap-2">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm"
                >Trước</button>
                <button 
                    disabled={page * pagination.limit >= pagination.total}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm"
                >Sau</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SupplierRatingWidget;