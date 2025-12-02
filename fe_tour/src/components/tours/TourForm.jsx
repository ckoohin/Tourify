import React, { useState, useEffect } from 'react';
import { X, Save, Info, Map, Settings, RefreshCw, Copy, ArrowLeft, Image as ImageIcon, UploadCloud, Trash2 } from 'lucide-react';
import { validateTour } from '../../utils/validators/tourRules'; 
import { slugify } from '../../utils/slugify';
import tourService from '../../services/api/tourService';
import toast from 'react-hot-toast';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';

const InputGroup = ({ label, name, value, onChange, error, type = "text", required = false, disabled = false, ...props }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'} ${disabled ? 'bg-slate-100 text-slate-500' : ''}`}
            {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const TourForm = ({ 
    isOpen = true, 
    onClose = () => {}, 
    onSuccess = () => {}, 
    onSubmit, 
    initialData, 
    categories = [], 
    currentUserId, 
    title 
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});
  const [isCloneMode, setIsCloneMode] = useState(false);

  const { uploadMultipleImages, uploading, progress } = useCloudinaryUpload();

  const generateTourCode = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); 
    return `TOUR-${randomNum}`;
  };

  const [formData, setFormData] = useState({
    code: '', name: '', slug: '', category_id: '', description: '', highlights: '',
    duration_days: 1, duration_nights: 0, departure_location: '', destination: '',
    min_group_size: 1, max_group_size: 20, is_customizable: '0', qr_code: '',
    booking_url: '', status: 'draft', created_by: currentUserId || 1,
    images: [] 
  });

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setActiveTab('general');
      setIsCloneMode(false);

      if (initialData) {
        let customVal = '0';
        if (initialData.is_customizable !== undefined && initialData.is_customizable !== null) {
            customVal = String(initialData.is_customizable);
        }

        setFormData({
            ...initialData,
            is_customizable: customVal,
            category_id: initialData.category_id || '',
            description: initialData.description || '',
            highlights: initialData.highlights || '',
            departure_location: initialData.departure_location || '',
            destination: initialData.destination || '',
            qr_code: initialData.qr_code || '',
            booking_url: initialData.booking_url || '',
            status: initialData.status || 'draft',
            created_by: initialData.created_by || currentUserId || 1,
            images: Array.isArray(initialData.images) ? initialData.images.map(img => img.url || img) : []
        });
      } else {
        setFormData({
            code: generateTourCode(),
            name: '', slug: '', category_id: '', description: '', highlights: '',
            duration_days: 1, duration_nights: 0, departure_location: '', destination: '',
            min_group_size: 1, max_group_size: 20, is_customizable: '0', qr_code: '', 
            booking_url: '', status: 'draft', created_by: currentUserId || 1,
            images: []
        });
      }
    }
  }, [isOpen, initialData, currentUserId]);

  const handleSwitchToClone = () => {
    setIsCloneMode(true);
    const newName = `${formData.name} (Sao chép)`;
    setFormData(prev => ({
        ...prev,
        name: newName,
        code: generateTourCode(),
        slug: slugify(newName),
        status: 'draft'
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
        const newSlug = slugify(value);
        setFormData(prev => ({
            ...prev,
            name: value,
            slug: (!initialData || isCloneMode || !prev.slug) ? newSlug : prev.slug
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleRegenerateCode = () => {
    setFormData(prev => ({ ...prev, code: generateTourCode() }));
  };

  const handleSlugChange = (e) => {
     setFormData(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadedUrls = await uploadMultipleImages(files, 'tours');

    if (uploadedUrls.length > 0) {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls] 
        }));
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`);
    } else {
        toast.error("Lỗi tải ảnh lên");
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Xử lý Clone
    if (isCloneMode) {
        if (!formData.name || !formData.code || !formData.slug) {
            toast.error("Vui lòng nhập đầy đủ Tên, Mã và Slug cho tour mới");
            return;
        }
        try {
            const payload = {
                new_name: formData.name,
                new_code: formData.code,
                new_slug: formData.slug,
                created_by: currentUserId || 1 
            };
            const res = await tourService.cloneTour(initialData.id, payload);
            if (res.success) {
                toast.success("Sao chép tour thành công!");
                onSuccess(); 
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi sao chép tour");
        }
        return;
    }

    // 2. Validate Frontend
    const validationErrors = validateTour(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    // 3. Chuẩn hóa Payload
    const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        duration_days: Number(formData.duration_days),
        duration_nights: Number(formData.duration_nights),
        min_group_size: Number(formData.min_group_size) || 1,
        max_group_size: Number(formData.max_group_size) || 20,
        
        created_by: formData.created_by || initialData?.created_by || currentUserId || 1,
        is_customizable: (String(formData.is_customizable) === '1') ? '1' : '0'
    };

    console.log("Submitting Payload:", payload);

    if (onSubmit) {
        onSubmit(payload);
    } else {
        console.error("onSubmit function is missing in TourForm props");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transition-all">
        
        <div className={`px-6 py-4 border-b flex justify-between items-center rounded-t-xl ${isCloneMode ? 'bg-purple-50 border-purple-100' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-3">
                {isCloneMode && (
                    <button onClick={() => setIsCloneMode(false)} className="p-1 hover:bg-white rounded-full text-slate-500 transition-colors" title="Quay lại">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h3 className={`font-bold text-xl ${isCloneMode ? 'text-purple-700' : 'text-slate-800'}`}>
                        {isCloneMode ? 'Sao chép Tour' : title}
                    </h3>
                    {isCloneMode && <p className="text-xs text-purple-600">Tạo tour mới dựa trên dữ liệu của: <b>{initialData?.name}</b></p>}
                </div>
            </div>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        {isCloneMode ? (
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6 flex gap-3 items-start">
                        <Info className="text-purple-600 shrink-0 mt-0.5" size={20} />
                        <div className="text-sm text-purple-800">
                            <p className="font-bold mb-1">Lưu ý quan trọng:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Hệ thống sẽ sao chép toàn bộ <b>Hình ảnh, Phiên bản, Bảng giá, Chính sách</b> từ tour gốc.</li>
                                <li>Trạng thái tour mới sẽ được đặt là <b>Bản nháp (Draft)</b> để bạn kiểm tra trước khi mở bán.</li>
                            </ul>
                        </div>
                    </div>

                    <form id="cloneForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Tour Mới <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" name="code" value={formData.code} onChange={handleChange} 
                                        className="flex-1 px-3 py-2 border border-purple-300 rounded-lg bg-white font-mono text-purple-700 font-bold outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button type="button" onClick={handleRegenerateCode} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200" title="Sinh mã mới">
                                        <RefreshCw size={18}/>
                                    </button>
                                </div>
                            </div>
                            <InputGroup label="Tên Tour Mới" name="name" value={formData.name} onChange={handleChange} error={errors.name} required placeholder="VD: Hà Giang Mùa Hoa (Copy)" autoFocus />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" name="slug" value={formData.slug} onChange={handleSlugChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 outline-none focus:border-purple-500"
                                />
                                <p className="text-xs text-slate-400 mt-1">Tự động tạo từ tên tour.</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        ) : (
        <>
            <div className="flex border-b px-6 bg-white sticky top-0 z-10">
                {[
                    {id: 'general', label: 'Thông tin chung', icon: Info},
                    {id: 'details', label: 'Chi tiết & Hành trình', icon: Map},
                    {id: 'images', label: 'Thư viện ảnh', icon: ImageIcon}, 
                    {id: 'settings', label: 'Cấu hình & Khác', icon: Settings},
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <tab.icon size={16}/> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <form id="tourForm" onSubmit={handleSubmit}>
                    {/* Tab 1: General */}
                    <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Tour <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <input type="text" name="code" value={formData.code} onChange={handleChange} className={`flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-blue-700 font-bold outline-none ${errors.code ? 'border-red-500' : 'border-slate-300'}`} />
                                    {!initialData && <button type="button" onClick={handleRegenerateCode} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-300"><RefreshCw size={18}/></button>}
                                </div>
                                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái <span className="text-red-500">*</span></label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white cursor-pointer">
                                    <option value="draft">Bản nháp (Draft)</option>
                                    <option value="active">Hoạt động (Active)</option>
                                    <option value="inactive">Tạm ngưng (Inactive)</option>
                                    <option value="archived">Lưu trữ (Archived)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <InputGroup label="Tên Tour" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                            </div>
                            <div className="md:col-span-2 mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL) <span className="text-red-500">*</span></label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleSlugChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 text-slate-600 outline-none ${errors.slug ? 'border-red-500' : 'border-slate-300'}`} />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-white cursor-pointer ${errors.category_id ? 'border-red-500' : 'border-slate-300'}`}>
                                    <option value="">-- Chọn danh mục --</option>
                                    {Array.isArray(categories) && categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Số ngày" name="duration_days" type="number" min="0" value={formData.duration_days} onChange={handleChange} error={errors.duration_days} required />
                                <InputGroup label="Số đêm" name="duration_nights" type="number" min="0" value={formData.duration_nights} onChange={handleChange} error={errors.duration_nights} required />
                            </div>
                        </div>
                    </div>

                    {/* Tab 2: Details */}
                    <div className={activeTab === 'details' ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <InputGroup label="Điểm khởi hành" name="departure_location" value={formData.departure_location} onChange={handleChange} />
                            <InputGroup label="Điểm đến" name="destination" value={formData.destination} onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Điểm nổi bật</label>
                            <textarea name="highlights" value={formData.highlights} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"></textarea>
                        </div>
                    </div>

                    {/* Tab 3: Images */}
                    <div className={activeTab === 'images' ? 'block' : 'hidden'}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tải ảnh lên</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                                        <p className="text-sm text-blue-600 font-medium">Đang tải lên... {progress}%</p>
                                    </div>
                                ) : (
                                    <>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            onChange={handleImageUpload} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <UploadCloud size={40} className="mx-auto text-slate-400 mb-3" />
                                        <p className="text-sm text-slate-600 font-medium">Kéo thả hoặc nhấn để chọn ảnh</p>
                                        <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP (Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Image Preview Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Array.isArray(formData.images) && formData.images.map((url, index) => (
                                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
                                    <img src={url} alt={`Tour ${index + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transform hover:scale-110 transition-all"
                                            title="Xóa ảnh"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {(!formData.images || formData.images.length === 0) && !uploading && (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Chưa có hình ảnh nào.</div>
                        )}
                    </div>

                    {/* Tab 4: Settings */}
                    <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Min Pax" name="min_group_size" type="number" value={formData.min_group_size} onChange={handleChange} error={errors.min_group_size} />
                            <InputGroup label="Max Pax" name="max_group_size" type="number" value={formData.max_group_size} onChange={handleChange} error={errors.max_group_size} />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Loại hình</label>
                                <select name="is_customizable" value={formData.is_customizable} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                                    <option value="0">Tour trọn gói</option>
                                    <option value="1">Tour thiết kế riêng</option>
                                </select>
                            </div>
                            <InputGroup label="QR Code URL" name="qr_code" value={formData.qr_code} onChange={handleChange} />
                            <div className="md:col-span-2"><InputGroup label="Booking URL" name="booking_url" value={formData.booking_url} onChange={handleChange} /></div>
                        </div>
                    </div>
                </form>
            </div>
        </>
        )}

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center rounded-b-xl">
            <div>
                {initialData && !isCloneMode && (
                    <button 
                        type="button" 
                        onClick={handleSwitchToClone}
                        className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg font-medium transition-colors"
                    >
                        <Copy size={18} /> Sao chép Tour
                    </button>
                )}
            </div>

            <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 font-medium">Hủy</button>
                
                <button 
                    type="submit" 
                    form={isCloneMode ? "cloneForm" : "tourForm"} 
                    disabled={uploading} 
                    className={`px-6 py-2 text-white rounded-lg font-medium flex items-center gap-2 shadow-md transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''} ${isCloneMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    <Save size={18}/> {isCloneMode ? 'Xác nhận Sao chép' : 'Lưu Tour'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TourForm;