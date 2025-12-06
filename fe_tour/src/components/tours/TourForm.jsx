import React, { useState, useEffect } from 'react';
import { 
  X, Save, Info, Map, Settings, RefreshCw, Copy, ArrowLeft, 
  Image as ImageIcon, UploadCloud, Trash2, Plus, Clock, 
  ShieldCheck, FileText, StickyNote, Utensils, BedDouble, List, AlertCircle
} from 'lucide-react';
import { validateTour } from '../../utils/validators/tourRules'; 
import { slugify } from '../../utils/slugify';
import tourService from '../../services/api/tourService';
import toast from 'react-hot-toast';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';

// --- SUB-COMPONENT: Input Group ---
const InputGroup = ({ label, name, value, onChange, error, type = "text", required = false, disabled = false, className="", ...props }) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'} ${disabled ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
            {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

// --- MAIN COMPONENT ---
const TourForm = ({ 
    isOpen = true, 
    onClose = () => {}, 
    onSuccess = () => {}, 
    initialData, 
    categories = [], 
    currentUserId, 
    title 
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});
  const [isCloneMode, setIsCloneMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadMultipleImages, uploading, progress } = useCloudinaryUpload();

  // Initial State
  const initialFormState = {
    code: '', name: '', slug: '', category_id: '', description: '', highlights: '',
    duration_days: 1, duration_nights: 0, departure_location: '', destination: '',
    min_group_size: 1, max_group_size: 20, is_customizable: '0', qr_code: '',
    booking_url: '', status: 'draft', created_by: currentUserId || 1,
    images: [],
    // Extended Arrays for Unified Form
    itineraries: [], 
    policies: []
  };

  const [formData, setFormData] = useState(initialFormState);

  // Helper: Generate Code
  const generateTourCode = () => `TOUR-${Math.floor(100000 + Math.random() * 900000)}`;

  // --- EFFECT: LOAD DATA ---
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setActiveTab('general');
      setIsCloneMode(false);

      const loadFullData = async () => {
        if (initialData) {
            // Load Basic Info
            let baseData = {
                ...initialData,
                is_customizable: String(initialData.is_customizable ?? '0'),
                images: Array.isArray(initialData.images) ? initialData.images.map(img => img.url || img) : [],
                // [FIX] Đảm bảo created_by luôn có giá trị khi load edit
                created_by: initialData.created_by || currentUserId || 1, 
                itineraries: [],
                policies: []
            };

            // Nếu là Edit Mode, cần fetch thêm Itineraries và Policies để hiển thị
            if (!isCloneMode) {
                try {
                    // 1. Get Default Version ID to fetch Itineraries
                    const verRes = await tourService.getVersions(initialData.id);
                    const versions = verRes.data?.tourVersions || verRes.data?.versions || [];
                    const defaultVer = versions.find(v => v.is_default) || versions[0];

                    if (defaultVer) {
                        const itinRes = await tourService.getItineraries(defaultVer.id);
                        // [FIX] Parse JSON activities/meals nếu cần thiết (tùy backend trả về)
                        const rawItineraries = itinRes.data?.itineraries || [];
                        baseData.itineraries = rawItineraries.map(it => ({
                            ...it,
                            activities: typeof it.activities === 'string' ? JSON.parse(it.activities) : (it.activities || []),
                            meals: typeof it.meals === 'string' ? JSON.parse(it.meals) : (it.meals || {})
                        })).sort((a, b) => a.day_number - b.day_number);
                    }

                    // 2. Get Policies
                    const polRes = await tourService.getPolicies(initialData.id);
                    baseData.policies = (polRes.data?.policies || []).sort((a, b) => a.display_order - b.display_order);

                } catch (error) {
                    console.error("Lỗi load dữ liệu mở rộng:", error);
                    toast.error("Không thể tải đầy đủ thông tin chi tiết");
                }
            }
            setFormData(baseData);
        } else {
            setFormData({ ...initialFormState, code: generateTourCode() });
        }
      };
      
      loadFullData();
    }
  }, [isOpen, initialData, currentUserId]); 

  // --- HANDLERS: BASIC FORM ---
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

  // --- HANDLERS: IMAGES ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const uploadedUrls = await uploadMultipleImages(files, 'tours');
    if (uploadedUrls.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`);
    }
  };

  // --- HANDLERS: ITINERARY (Local State) ---
  const addItineraryDay = () => {
    const nextDay = formData.itineraries.length + 1;
    setFormData(prev => ({
        ...prev,
        itineraries: [
            ...prev.itineraries,
            { 
                // ID tạm thời để React key hoạt động, sẽ bị loại bỏ khi gửi API
                tempId: Date.now(), 
                day_number: nextDay, 
                title: '', 
                description: '', 
                activities: [''],
                meals: { breakfast: false, lunch: false, dinner: false },
                accommodation: ''
            }
        ]
    }));
  };

  const updateItinerary = (index, field, value) => {
    const newItineraries = [...formData.itineraries];
    newItineraries[index] = { ...newItineraries[index], [field]: value };
    setFormData(prev => ({ ...prev, itineraries: newItineraries }));
  };

  const removeItinerary = (index) => {
    const newItineraries = formData.itineraries.filter((_, i) => i !== index);
    // Recalculate day numbers
    const reordered = newItineraries.map((item, idx) => ({ ...item, day_number: idx + 1 }));
    setFormData(prev => ({ ...prev, itineraries: reordered }));
  };

  // --- HANDLERS: POLICY (Local State) ---
  const addPolicy = () => {
    setFormData(prev => ({
        ...prev,
        policies: [
            ...prev.policies,
            { 
                tempId: Date.now(), 
                policy_type: 'cancellation', 
                title: '', 
                content: '', 
                is_active: true 
            }
        ]
    }));
  };

  const updatePolicy = (index, field, value) => {
    const newPolicies = [...formData.policies];
    newPolicies[index] = { ...newPolicies[index], [field]: value };
    setFormData(prev => ({ ...prev, policies: newPolicies }));
  };

  const removePolicy = (index) => {
    const newPolicies = formData.policies.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, policies: newPolicies }));
  };

  // --- [QUAN TRỌNG] MAIN SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Validate Basic Info
    const validationErrors = validateTour(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab('general');
      toast.error("Vui lòng kiểm tra lại thông tin chung");
      setIsSubmitting(false);
      return;
    }

    try {
        // 2. Prepare Payload for Tour
        const tourPayload = {
            ...formData,
            category_id: Number(formData.category_id),
            duration_days: Number(formData.duration_days),
            duration_nights: Number(formData.duration_nights),
            min_group_size: Number(formData.min_group_size) || 1,
            max_group_size: Number(formData.max_group_size) || 20,
            is_customizable: formData.is_customizable === '1' ? '1' : '0',
            created_by: Number(formData.created_by || initialData?.created_by || currentUserId || 1)
        };

        let tourId = initialData?.id;
        let defaultVersionId = null;

        // 3. Save TOUR (Create or Update)
        if (initialData && !isCloneMode) {
            await tourService.updateTour(tourId, tourPayload);
        } else {
            const res = await tourService.createTour(tourPayload);
            // Lấy ID tour vừa tạo
            tourId = res.data?.tour?.id || res.data?.id; 
        }

        if (!tourId) throw new Error("Không lấy được ID Tour sau khi lưu");

        // 4. Get or Create Default Version
        // (Chúng ta cần ID version để lưu lịch trình)
        const verRes = await tourService.getVersions(tourId);
        const versions = verRes.data?.tourVersions || verRes.data?.versions || [];
        let defaultVer = versions.find(v => v.is_default);

        if (!defaultVer) {
            // Nếu chưa có version nào, tạo mới
            const verPayload = { 
                tour_id: tourId, 
                name: "Phiên bản tiêu chuẩn", 
                type: "standard", 
                is_default: true, 
                is_active: true 
            };
            const newVerRes = await tourService.createVersion(verPayload);
            defaultVersionId = newVerRes.data?.tourVersion?.id;
        } else {
            defaultVersionId = defaultVer.id;
        }

        // 5. Save Itineraries (Logic: Xóa cũ -> Thêm mới)
        // Đây là cách an toàn nhất để đồng bộ mảng lịch trình
        if (defaultVersionId) {
            // Xóa tất cả lịch trình cũ của version này
            await tourService.deleteAllItineraries(defaultVersionId);
            
            // Thêm mới từng ngày từ formData
            if (formData.itineraries.length > 0) {
                await Promise.all(formData.itineraries.map(it => 
                    tourService.createItinerary({
                        tour_version_id: defaultVersionId,
                        day_number: parseInt(it.day_number),
                        title: it.title,
                        description: it.description || '',
                        accommodation: it.accommodation || '',
                        meals: it.meals,
                        activities: Array.isArray(it.activities) ? it.activities.filter(a => a.trim()) : [],
                        notes: it.notes || ''
                    })
                ));
            }
        }

        // 6. Save Policies (Logic: Xóa cũ -> Thêm mới)
        if (tourId) {
             // Lấy danh sách cũ để xóa
             const existingPolicies = await tourService.getPolicies(tourId);
             const pList = existingPolicies.data?.policies || [];
             
             // Xóa cũ
             if (pList.length > 0) {
                 await Promise.all(pList.map(p => tourService.deletePolicy(p.id)));
             }

             // Thêm mới
             if (formData.policies.length > 0) {
                 await Promise.all(formData.policies.map((p, idx) => 
                    tourService.createPolicy({
                        tour_id: tourId,
                        policy_type: p.policy_type,
                        title: p.title,
                        content: p.content,
                        display_order: idx + 1, // Tự động đánh số thứ tự
                        is_active: true
                    })
                 ));
             }
        }

        toast.success(initialData && !isCloneMode ? "Cập nhật tour và dữ liệu chi tiết thành công!" : "Tạo tour mới thành công!");
        onSuccess(); // Gọi hàm refresh list từ cha
        onClose();

    } catch (error) {
        console.error("Submit Error:", error);
        const errMsg = error.response?.data?.message || error.message || "Có lỗi xảy ra khi lưu dữ liệu";
        toast.error(errMsg);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
            <div className="flex items-center gap-3">
                {isCloneMode && (
                    <button onClick={() => setIsCloneMode(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h3 className="font-bold text-xl text-slate-800">
                        {isCloneMode ? 'Sao chép Tour' : (initialData ? `Cập nhật: ${initialData.code}` : 'Thêm mới Tour')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Điền đầy đủ thông tin bên dưới</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                <X size={24}/>
            </button>
        </div>

        {/* CLONE MODE WARNING */}
        {isCloneMode && (
            <div className="px-6 pt-6">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 items-start">
                    <Info className="text-purple-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-purple-800">
                        <p className="font-bold mb-1">Chế độ sao chép:</p>
                        <p>Hệ thống sẽ tạo một tour mới với toàn bộ thông tin, hình ảnh, lịch trình và chính sách từ tour gốc. Mã tour và đường dẫn sẽ được tạo mới.</p>
                    </div>
                </div>
            </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="px-6 pt-4 border-b border-slate-100 flex gap-6 overflow-x-auto bg-white">
            {[
                {id: 'general', label: 'Thông tin chung', icon: Info},
                {id: 'itinerary', label: 'Lịch trình chi tiết', icon: Map},
                {id: 'images', label: 'Thư viện ảnh', icon: ImageIcon},
                {id: 'policy', label: 'Chính sách', icon: ShieldCheck},
                {id: 'settings', label: 'Cấu hình', icon: Settings},
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <tab.icon size={18}/> {tab.label}
                    {/* Badge count for arrays */}
                    {tab.id === 'itinerary' && formData.itineraries.length > 0 && 
                        <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full">{formData.itineraries.length}</span>}
                    {tab.id === 'policy' && formData.policies.length > 0 && 
                        <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full">{formData.policies.length}</span>}
                </button>
            ))}
        </div>

        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
            <form id="tourForm" onSubmit={handleSubmit} className="max-w-5xl mx-auto">
                
                {/* 1. GENERAL TAB */}
                <div className={activeTab === 'general' ? 'block space-y-6' : 'hidden'}>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={18} className="text-blue-500"/> Cơ bản</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Tour <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <input type="text" name="code" value={formData.code} onChange={handleChange} className={`flex-1 px-3 py-2 border rounded-lg bg-slate-50 font-mono text-blue-700 font-bold outline-none ${errors.code ? 'border-red-500' : 'border-slate-300'}`} />
                                    {!initialData && <button type="button" onClick={() => setFormData(p => ({...p, code: generateTourCode()}))} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-300"><RefreshCw size={18}/></button>}
                                </div>
                                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-500">
                                    <option value="draft">Bản nháp</option>
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Tạm ngưng</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <InputGroup label="Tên Tour" name="name" value={formData.name} onChange={handleChange} error={errors.name} required placeholder="VD: Hà Giang - Mùa Hoa Tam Giác Mạch" />
                            </div>
                            <div className="md:col-span-2">
                                <InputGroup label="Slug (URL)" name="slug" value={formData.slug} onChange={handleChange} error={errors.slug} className="font-mono text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-white cursor-pointer ${errors.category_id ? 'border-red-500' : 'border-slate-300'}`}>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Số ngày" name="duration_days" type="number" min="0" value={formData.duration_days} onChange={handleChange} />
                                <InputGroup label="Số đêm" name="duration_nights" type="number" min="0" value={formData.duration_nights} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Map size={18} className="text-green-500"/> Địa điểm & Mô tả</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <InputGroup label="Điểm khởi hành" name="departure_location" value={formData.departure_location} onChange={handleChange} placeholder="VD: Hà Nội" />
                            <InputGroup label="Điểm đến" name="destination" value={formData.destination} onChange={handleChange} placeholder="VD: Hà Giang" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Điểm nổi bật (Mỗi dòng 1 ý)</label>
                            <textarea name="highlights" value={formData.highlights} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="- Checkin Cột cờ Lũng Cú&#10;- Đi thuyền sông Nho Quế"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                    </div>
                </div>

                {/* 2. ITINERARY TAB (Unified) */}
                <div className={activeTab === 'itinerary' ? 'block space-y-6' : 'hidden'}>
                    {formData.itineraries.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3"><List size={32}/></div>
                            <p className="text-slate-500 font-medium">Chưa có lịch trình nào.</p>
                            <button type="button" onClick={addItineraryDay} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">Tạo ngày đầu tiên</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.itineraries.map((day, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl"></div>
                                    <div className="flex justify-between items-start mb-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm">Ngày {day.day_number}</span>
                                            <input 
                                                type="text" 
                                                value={day.title} 
                                                onChange={(e) => updateItinerary(idx, 'title', e.target.value)}
                                                placeholder="Tiêu đề (VD: Hà Nội - Hà Giang)"
                                                className="font-bold text-lg text-slate-800 border-none bg-transparent focus:ring-0 placeholder:text-slate-300 w-full md:w-96"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeItinerary(idx)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                                    </div>
                                    
                                    <div className="pl-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Mô tả hoạt động</label>
                                            <textarea 
                                                value={day.description} 
                                                onChange={(e) => updateItinerary(idx, 'description', e.target.value)}
                                                rows={3}
                                                className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                                placeholder="Mô tả chi tiết..."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1"><Utensils size={12}/> Ăn uống</label>
                                                <div className="flex gap-2">
                                                    {['breakfast', 'lunch', 'dinner'].map(meal => (
                                                        <label key={meal} className={`flex-1 text-center py-1.5 rounded border text-xs cursor-pointer select-none ${day.meals?.[meal] ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' : 'bg-slate-50 text-slate-400'}`}>
                                                            <input type="checkbox" className="hidden" checked={!!day.meals?.[meal]} onChange={() => {
                                                                const newMeals = { ...day.meals, [meal]: !day.meals?.[meal] };
                                                                updateItinerary(idx, 'meals', newMeals);
                                                            }} />
                                                            {meal === 'breakfast' ? 'Sáng' : meal === 'lunch' ? 'Trưa' : 'Tối'}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1"><BedDouble size={12}/> Nghỉ đêm</label>
                                                <input 
                                                    type="text" 
                                                    value={day.accommodation} 
                                                    onChange={(e) => updateItinerary(idx, 'accommodation', e.target.value)}
                                                    className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                                                    placeholder="Khách sạn..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addItineraryDay} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                <Plus size={20}/> Thêm ngày tiếp theo
                            </button>
                        </div>
                    )}
                </div>

                {/* 3. IMAGES TAB */}
                <div className={activeTab === 'images' ? 'block' : 'hidden'}>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative mb-6">
                            {uploading ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                                    <p className="text-sm text-blue-600 font-medium">Đang tải lên... {progress}%</p>
                                </div>
                            ) : (
                                <>
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                    <UploadCloud size={40} className="mx-auto text-slate-400 mb-3" />
                                    <p className="text-sm text-slate-600 font-medium">Kéo thả hoặc nhấn để chọn ảnh</p>
                                </>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.images.map((url, index) => (
                                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => {
                                        setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}));
                                    }} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. POLICY TAB (Unified) */}
                <div className={activeTab === 'policy' ? 'block space-y-4' : 'hidden'}>
                    {formData.policies.map((policy, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 items-start">
                            <div className="mt-1">
                                {policy.policy_type === 'cancellation' && <AlertCircle className="text-red-500" size={20}/>}
                                {policy.policy_type === 'refund' && <RefreshCw className="text-orange-500" size={20}/>}
                                {policy.policy_type === 'deposit' && <ShieldCheck className="text-green-500" size={20}/>}
                                {['change', 'other'].includes(policy.policy_type) && <FileText className="text-blue-500" size={20}/>}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <select 
                                        value={policy.policy_type} 
                                        onChange={(e) => updatePolicy(idx, 'policy_type', e.target.value)}
                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 font-medium text-slate-700 mb-2"
                                    >
                                        <option value="cancellation">Hủy tour</option>
                                        <option value="refund">Hoàn tiền</option>
                                        <option value="deposit">Đặt cọc</option>
                                        <option value="change">Thay đổi</option>
                                        <option value="other">Khác</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        value={policy.title} 
                                        onChange={(e) => updatePolicy(idx, 'title', e.target.value)}
                                        placeholder="Tiêu đề chính sách"
                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 font-bold"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <textarea 
                                        value={policy.content} 
                                        onChange={(e) => updatePolicy(idx, 'content', e.target.value)}
                                        rows={3}
                                        placeholder="Nội dung chi tiết..."
                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 resize-none"
                                    />
                                </div>
                            </div>
                            <button type="button" onClick={() => removePolicy(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addPolicy} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-white hover:border-slate-400 transition-colors flex items-center justify-center gap-2">
                        <Plus size={20}/> Thêm chính sách mới
                    </button>
                </div>

                {/* 5. SETTINGS TAB */}
                <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Số khách tối thiểu" name="min_group_size" type="number" value={formData.min_group_size} onChange={handleChange} />
                        <InputGroup label="Số khách tối đa" name="max_group_size" type="number" value={formData.max_group_size} onChange={handleChange} />
                        <div>
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

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-white flex justify-between items-center z-20">
            <div>
                {initialData && !isCloneMode && (
                    <button type="button" onClick={() => { setIsCloneMode(true); setFormData(p => ({...p, name: `${p.name} (Copy)`, code: generateTourCode(), status: 'draft'})); }} className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition-colors">
                        <Copy size={18} /> Sao chép Tour
                    </button>
                )}
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors">Hủy</button>
                
                <button 
                    type="submit" 
                    form={isCloneMode ? "cloneForm" : "tourForm"} 
                    disabled={isSubmitting || uploading} 
                    className={`px-8 py-2.5 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-300'}`}
                >
                    {isSubmitting ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <Save size={18}/>}
                    {isCloneMode ? 'Xác nhận Sao chép' : 'Lưu Tour'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TourForm;