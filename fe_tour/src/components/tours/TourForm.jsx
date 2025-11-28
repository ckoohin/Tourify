import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, MapPin, Tag, FileText, Settings } from 'lucide-react';
import tourService from '../../services/api/tourService';
import tourCategoryService from '../../services/api/tourCategoryService';
import { validateTour } from '../../utils/validators/tourRules';
import toast from 'react-hot-toast';

const TourForm = ({ initialData, onClose, onSuccess }) => {
  const isEdit = !!(initialData && initialData.id);
  
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    code: '', name: '', slug: '', category_id: '', description: '', highlights: '',
    duration_days: 1, duration_nights: 0, departure_location: '', destination: '',
    min_group_size: 1, max_group_size: 20, is_customizable: 0, booking_url: '',
    status: 'draft', created_by: 1
  });

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await tourCategoryService.getAll();
            const cats = Array.isArray(res.data) ? res.data : (res.data?.categories || []);
            setCategories(cats.filter(c => c.is_active === 1));
        } catch (err) { console.error(err); }
    };
    fetchCategories();

    if (initialData) {
      setFormData(prev => ({ 
          ...prev, 
          ...initialData,
          code: initialData.code || '',
          name: initialData.name || '',
          slug: initialData.slug || '',
          category_id: initialData.category_id || '',
          description: initialData.description || '',
          highlights: initialData.highlights || '',
          departure_location: initialData.departure_location || '',
          destination: initialData.destination || '',
          booking_url: initialData.booking_url || '',
          duration_days: initialData.duration_days ?? 1,
          duration_nights: initialData.duration_nights ?? 0,
          min_group_size: initialData.min_group_size ?? 1,
          max_group_size: initialData.max_group_size ?? 20,
          is_customizable: initialData.is_customizable ? 1 : 0,
          status: initialData.status || 'draft'
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
    const newData = { ...formData, [name]: finalValue };
    setFormData(newData);

    if (errors[name]) {
        const currentErrors = validateTour(newData);
        setErrors(prev => {
            const newErr = { ...prev };
            if (!currentErrors[name]) delete newErr[name];
            return newErr;
        });
    }
  };

  const handleGenerateSlug = () => {
      if (formData.name) {
          const slug = formData.name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim().replace(/\s+/g, "-");
          setFormData(prev => ({ ...prev, slug }));
          setErrors(prev => { const e = {...prev}; delete e.slug; return e; });
          
          toast.success("Đã tạo Slug!", { className: 'my-toast-success' });
      } else {
          toast.error("Nhập tên Tour trước!", { className: 'my-toast-error' });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateTour(formData);
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error("Kiểm tra lại thông tin!", { className: 'my-toast-error' });
        return;
    }

    try {
      const toastId = toast.loading("Đang lưu...", { className: 'my-toast-loading' });
      const payload = {
        ...formData,
        category_id: Number(formData.category_id), 
        duration_days: Number(formData.duration_days),
        duration_nights: Number(formData.duration_nights),
        min_group_size: Number(formData.min_group_size),
        max_group_size: formData.max_group_size ? Number(formData.max_group_size) : null,
        is_customizable: Number(formData.is_customizable),
        created_by: Number(formData.created_by),
        qr_code: null 
      };

      let res;
      if (isEdit) {
        res = await tourService.updateTour(initialData.id, payload);
      } else {
        res = await tourService.createTour(payload);
      }
      
      toast.dismiss(toastId);

      if (res.success) {
        toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo mới thành công!', { className: 'my-toast-success' });
        if (onSuccess) onSuccess(res.data); 
      }
    } catch (error) {
      toast.dismiss();
      console.error(error);
      const resData = error.response?.data;
      if (resData?.errors && Array.isArray(resData.errors)) {
          const msgs = resData.errors.map(e => e.msg || e.message).join('\n- ');
          toast.error(`Lỗi dữ liệu:\n- ${msgs}`, { className: 'my-toast-error' });
      } else {
          toast.error(resData?.message || error.message || 'Lỗi hệ thống', { className: 'my-toast-error' });
      }
    }
  };

  const ErrorMsg = ({ field }) => errors[field] && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium"><AlertCircle size={12}/> {errors[field]}</p>
  );

  const getInputClass = (field) => `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all duration-200 shadow-sm ${errors[field] ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-300 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50'}`;

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-blue-700">
        <Icon size={18} /> <h3 className="font-bold text-sm uppercase">{title}</h3>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CỘT 1 */}
        <div className="space-y-6">
            {/* Định danh */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <SectionHeader icon={Tag} title="Thông tin cơ bản" />
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tên Tour <span className="text-red-500">*</span></label>
                        <input name="name" value={formData.name} onChange={handleChange} className={getInputClass('name')} placeholder="Nhập tên tour..." />
                        <ErrorMsg field="name" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Tour</label>
                            <input name="code" value={formData.code} onChange={handleChange} className={`${getInputClass('code')} font-mono uppercase`} placeholder="DN-001" />
                            <ErrorMsg field="code" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Danh mục</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className={getInputClass('category_id')}>
                                <option value="">-- Chọn --</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ErrorMsg field="category_id" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Slug URL</label>
                        <div className="flex gap-2">
                            <input name="slug" value={formData.slug} onChange={handleChange} className={getInputClass('slug')} placeholder="ten-tour-url" />
                            <button type="button" onClick={handleGenerateSlug} className="px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">Tạo</button>
                        </div>
                        <ErrorMsg field="slug" />
                    </div>
                </div>
            </div>

            {/* Vận hành */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <SectionHeader icon={MapPin} title="Vận hành & Lịch trình" />
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Điểm đi</label>
                            <input name="departure_location" value={formData.departure_location} onChange={handleChange} className={getInputClass('departure_location')} />
                            <ErrorMsg field="departure_location" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Điểm đến</label>
                            <input name="destination" value={formData.destination} onChange={handleChange} className={getInputClass('destination')} />
                            <ErrorMsg field="destination" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Số ngày</label>
                            <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} className={getInputClass('duration_days')} />
                            <ErrorMsg field="duration_days" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Số đêm</label>
                            <input type="number" name="duration_nights" value={formData.duration_nights} onChange={handleChange} className={getInputClass('duration_nights')} />
                            <ErrorMsg field="duration_nights" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Min khách</label>
                            <input type="number" name="min_group_size" value={formData.min_group_size} onChange={handleChange} className={getInputClass('min_group_size')} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Max khách</label>
                            <input type="number" name="max_group_size" value={formData.max_group_size || ''} onChange={handleChange} className={getInputClass('max_group_size')} />
                            <ErrorMsg field="max_group_size" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* CỘT 2 */}
        <div className="space-y-6">
            {/* Nội dung */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-full">
                <SectionHeader icon={FileText} title="Nội dung chi tiết" />
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Điểm nổi bật</label>
                        <textarea name="highlights" value={formData.highlights} onChange={handleChange} rows="4" className={getInputClass('highlights')} placeholder="Mỗi dòng một ý..."></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Mô tả chi tiết</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="8" className={getInputClass('description')} placeholder="Giới thiệu..."></textarea>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Cấu hình & Footer */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
                <Settings size={16} className="text-slate-500"/>
                <select name="status" value={formData.status} onChange={handleChange} className="border border-slate-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500">
                    <option value="draft">Bản nháp</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm ẩn</option>
                    <option value="archived">Lưu trữ</option>
                </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input type="checkbox" name="is_customizable" checked={formData.is_customizable === 1} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span>Tour thiết kế riêng</span>
            </label>
         </div>

         <div className="flex gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium text-sm">Hủy</button>
             <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md text-sm flex items-center gap-2">
                <Save size={16} /> {isEdit ? 'Lưu Thay Đổi' : 'Tạo Mới'}
             </button>
         </div>
      </div>
    </form>
  );
};

export default TourForm;