import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, DollarSign, Info, FileText, Layers } from 'lucide-react';
import { validateBooking } from '../../utils/validators/bookingRules'; 
import toast from 'react-hot-toast';

// Lấy các hàm gọi api
import customerService from '../../services/api/CustomerService';
import tourService from '../../services/api/tourService';
import quoteService from '../../services/api/quoteService';

const BookingForm = ({ isOpen, onClose, onSubmit, initialData, title, action, currentUser }) => {

  const [customer, setCustomer] = useState([]); //Lưu tất cả khách hàng trong bảng quotes với trạng thái status = sent
  const [quotes, setQuotes] = useState([]); // Lưu tất cả báo giá của khách hàng sau khi chọn customer ID
  const [quotesSelected, setQuotesSelected] = useState(""); // Lưu index của quotes được chọn trong mảng báo giá
  const [tourVersionName, setTourVersionName] = useState(""); // Lưu tên của tour version kho chọn báo giá
  const [listPrices, setListPrices] = useState([]);
  const [adultPrice, setAdultPrice] = useState(0);
  const [childPrice, setchildPrice] = useState(0);
  const [infantPrice, setInfantPrice] = useState(0);
  const [seniorPrice, setSeniorPrice] = useState(0);
  const [changeGuest, setChangGuest] = useState(0);

  const [activeTab, setActiveTab] = useState('general'); 

  const [formData, setFormData] = useState({
    booking_code: '',
    customer_id: '',
    tour_version_id: '',
    booking_type: 'individual',
    departure_date: '',
    status: 'pending',
    total_adults: 0,
    total_children: 0,
    total_infants: 0,
    total_senior: 0,
    total_guests: 0,
    unit_price: 0,
    total_amount: 0,
    discount_amount: 0,
    final_amount: 0,
    paid_amount: 0,
    remaining_amount: 0,
    currency: 'VND',
    special_requests: '',
    internal_notes: '',
    sales_person_id: '',
    created_by: currentUser?.id || 1
  });

  const [errors, setErrors] = useState({});

  async function getAllCustomers() {
    const res = await customerService.getAllCustomerInQuotes();
    setCustomer(res.data.customers);
  }

  async function getNameAndAllPriceByTourVerSionId(id) {
    const resPrice = await tourService.getPricesByVersion(id);
    const resTourVersionInFo = await tourService.getVersionById(id);
    setListPrices(resPrice.data.tourPrices);
    setTourVersionName(resTourVersionInFo.data.tourVersion[0].name);
  }

  async function getAllQuotesById(id) {
    const res = await quoteService.getQuotesByCustomerId(id);
    setQuotes(res.data.quotes);
  }

  function handleChangeQuotes(e) {
    setQuotesSelected(e.target.value);

    if (errors.quotesSelected) {
        setErrors(prev => ({ ...prev, quotesSelected: null }));
    }
  }

  
  useEffect(() => {
    getAllCustomers();
      if(action == 'create') {
        if(formData.customer_id) {
          getAllQuotesById(formData.customer_id);
        }
      }
  }, [formData.customer_id])

  useEffect(() => {
    if(listPrices.length > 0) {
      listPrices.forEach(price => {
          if(price.price_type == 'adult') {
            setAdultPrice(price.price)
          } else if(price.price_type == 'child') {
            setchildPrice(price.price)
          } else if(price.price_type == 'infant') {
            setInfantPrice(price.price)
          } else if(price.price_type == 'senior') {
            setSeniorPrice(price.price);
          }
        })
    }
  }, [listPrices])

  useEffect(() => {
    if(formData.tour_version_id) {
        getNameAndAllPriceByTourVerSionId(formData.tour_version_id);
      }
  }, [formData.tour_version_id])

  useEffect(() => {
    if(action == 'create') {
      if(quotesSelected) {
        const dataFillToForm = quotes.find((quote) => {
          return quote.id == quotesSelected;
        }); 
        setFormData(prev => ({
          ...prev,
          tour_version_id: dataFillToForm.tour_version_id,
          total_adults : dataFillToForm.adult_count,
          total_children: dataFillToForm.child_count,
          total_infants : dataFillToForm.infant_count,
          total_senior : dataFillToForm.senior_count,
          departure_date:`${new Date(dataFillToForm.departure_date).getFullYear()}-${String(new Date(dataFillToForm.departure_date).getMonth()+1).padStart(2,'0')}-${String(new Date(dataFillToForm.departure_date).getDate()).padStart(2,'0')}`,
          total_guests: Number(dataFillToForm.adult_count) + Number(dataFillToForm.child_count) + Number(dataFillToForm.infant_count) + Number(dataFillToForm.senior_count),
          total_amount : dataFillToForm.total_amount,
          unit_price : Number(dataFillToForm.total_amount) / (Number(dataFillToForm.adult_count) + Number(dataFillToForm.child_count) + Number(dataFillToForm.infant_count) + Number(dataFillToForm.senior_count)),
          discount_amount : dataFillToForm.discount_amount,
          final_amount : Number(dataFillToForm.total_amount) - Number(dataFillToForm.discount_amount),
          remaining_amount : Number(dataFillToForm.total_amount) - Number(dataFillToForm.discount_amount)
        }));
      }
    }
  }, [quotesSelected])

  useEffect(() => {
    if(changeGuest != 0) {
      const guests = Number(formData.total_adults) + Number(formData.total_children) + Number(formData.total_infants) + Number(formData.total_senior);
    

      const totalPrices = Number(adultPrice) * Number(formData.total_adults) + Number(childPrice) * Number(formData.total_children) + Number(infantPrice) * Number(formData.total_infants) + Number(seniorPrice) * Number(formData.total_senior);
      const unitPrice = totalPrices / guests ? totalPrices / guests : 0;
      const final = totalPrices - Number(formData.discount_amount);
      const remaining = final - Number(formData.paid_amount);

      setFormData(prev => ({
          ...prev,
          total_amount: totalPrices,
          total_guests: guests,
          final_amount: final >= 0 ? final : 0,
          unit_price: unitPrice,
          remaining_amount: remaining
      }));
  
      if (errors.unit_price || errors.total_amount) {
          setErrors(prev => ({ ...prev, unit_price: null, total_amount: null, total_guests:null }));
      }
    }

  }, [changeGuest]);


  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setActiveTab('general');
      if (initialData) {
        const formatted = { ...initialData };

        if (formatted.departure_date) formatted.departure_date = formatted.departure_date.split('T')[0];
        setFormData(formatted);
      } else {

        setFormData({
            booking_code: `BK-${Date.now()}`,
            customer_id: '',
            tour_version_id: '',
            booking_type: 'individual',
            departure_date: new Date().toISOString().split('T')[0],
            status: 'pending',
            total_adults: 0,
            total_children: 0,
            total_infants: 0,
            total_senior: 0,
            total_guests: 0,
            unit_price: 0,
            total_amount: 0,
            discount_amount: 0,
            final_amount: 0,
            paid_amount: 0,
            remaining_amount: 0,
            currency: 'VND',
            special_requests: '',
            internal_notes: '',
            sales_person_id: currentUser?.id || '',
            created_by: currentUser?.id || 1
        });

        setQuotesSelected("");
        setQuotes([]);
        setAdultPrice(0);
        setchildPrice(0);
        setInfantPrice(0);
        setTourVersionName("");
      }
    }
  }, [isOpen, initialData, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name == 'total_adults' || name == 'total_children' || name == 'total_infants' || name == 'total_senior' || name == 'discount_amount' || name == 'paid_amount') {
      setChangGuest((prev) => prev + 1);
    }
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let validationErrors ;
    if(action == 'create') {
      validationErrors = validateBooking(formData, quotesSelected);
    } else {
      validationErrors = validateBooking(formData);
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Vui lòng kiểm tra lại thông tin");
      
      if (validationErrors.booking_code || validationErrors.customer_id) setActiveTab('general');
      else if (validationErrors.total_adults) setActiveTab('guests');
      else if (validationErrors.total_amount) setActiveTab('finance');
      
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  const InputGroup = ({ label, name, type = "text", required = false, ...props }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors[name] ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
        {...props}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h3 className="font-bold text-xl text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">Điền đầy đủ thông tin để tạo booking mới</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"><X size={24}/></button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white sticky top-0 z-10">
            {[
                { id: 'general', label: 'Thông tin chung', icon: Info },
                { id: 'guests', label: 'Hành khách', icon: User },
                { id: 'finance', label: 'Tài chính', icon: DollarSign },
                { id: 'other', label: 'Ghi chú', icon: FileText },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <tab.icon size={16} /> {tab.label}
                    {Object.keys(errors).some(k => {
                        if(tab.id === 'general' && ['booking_code', 'customer_id', 'tour_version_id', 'departure_date'].includes(k)) return true;
                        if(tab.id === 'finance' && ['total_amount', 'unit_price'].includes(k)) return true;
                        return false;
                    }) && <span className="w-2 h-2 bg-red-500 rounded-full ml-1"></span>}
                </button>
            ))}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="booking-form" onSubmit={handleSubmit}>
            
            {/* Tab 1: Thông tin chung */}
            <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Mã Booking" name="booking_code" required />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loại Booking</label>
                        <select name="booking_type" value={formData.booking_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                            <option value="individual">Cá nhân</option>
                            <option value="group">Đoàn thể</option>
                        </select>
                    </div>

                    {/* lặp render ra danh sách khách hàng */}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Khách hàng</label>
                        <select disabled={action == 'edit' ? true : false} name="customer_id" value={formData.customer_id} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg ${errors.customer_id ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}>
                            <option value="">---Vui lòng chọn khách hàng---</option>
                            {customer.map((customer, index) => (
                              <option data-index={index} key={index} value={customer.id}>{customer.full_name}</option>
                            ))}
                        </select>
                        {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>}
                    </div>
                    
                    {action == 'create' && 
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bảng báo giá</label>
                        <select name="quotes" value={quotesSelected} onChange={handleChangeQuotes} className={`w-full px-3 py-2 border rounded-lg ${errors.quotesSelected ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}>
                            <option value="">---Vui lòng chọn mã báo giá---</option>
                            {quotes && quotes.length > 0 && quotes.map((quote, index) => (
                              <option data-index={index} key={index} value={quote.id}>{quote.quote_number}</option>
                            ))}
                        </select>
                        {errors.quotesSelected && <p className="text-red-500 text-xs mt-1">{errors.quotesSelected}</p>}
                    </div>
                    }

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên phiên bản tour</label>
                        <input
                          value={`${tourVersionName} - ${formData.tour_version_id}`}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors[name] ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                          readOnly
                        />
                    </div>
                    {/* <InputGroup label="Mã Tour Version (ID)" name="tour_version_id" type="number" required placeholder="Nhập ID phiên bản tour"/> */}
                    <InputGroup label="Ngày khởi hành" name="departure_date" type="date" required />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="deposited">Đã đặt cọc</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tab 2: Hành khách */}
            <div className={activeTab === 'guests' ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="mb-4">
                      <InputGroup label="Người lớn (>12t)" name="total_adults" type="number" />
                      <span>Giá người lớn: {new Intl.NumberFormat('vi-VN').format(adultPrice)} VND</span>
                    </div>
                    <div className="mb-4">
                      <InputGroup label="Trẻ em (2-11t)" name="total_children" type="number" />
                      <span>Giá trẻ em: {new Intl.NumberFormat('vi-VN').format(childPrice)} VND</span>
                    </div>
                    <div className="mb-4">
                      <InputGroup label="Em bé (<2t)" name="total_infants" type="number" />
                      <span>Giá em bé: {new Intl.NumberFormat('vi-VN').format(infantPrice)} VND</span>
                    </div>
                    <div className="mb-4">
                      <InputGroup label="Người cao tuổi (>60t)" name="total_senior" type="number" />
                      <span>Giá người cao tuổi: {new Intl.NumberFormat('vi-VN').format(seniorPrice)} VND</span>
                    </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                    <p className="text-sm text-blue-800 font-medium">Tổng số khách: <span className="text-xl font-bold ml-2">{formData.total_guests}</span></p>
                    {errors.total_guests && <p className="text-red-500 text-xs mt-1">{errors.total_guests}</p>}
                </div>
            </div>

            {/* Tab 3: Tài chính */}
            <div className={activeTab === 'finance' ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Đơn giá (Unit Price)" name="unit_price" type="number" required readOnly/>
                    <InputGroup label="Tổng tiền (Total Amount)" name="total_amount" type="number" required readOnly/>
                    <InputGroup label="Giảm giá (Discount)" name="discount_amount" type="number" />
                    <InputGroup label="Đã thanh toán (Paid)" name="paid_amount" type="number" />
                    
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-100">
                        <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                            <label className="block text-xs text-emerald-600 font-bold uppercase">Thành tiền</label>
                            <div className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('vi-VN').format(formData.final_amount)} VND</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded border border-red-100">
                            <label className="block text-xs text-red-600 font-bold uppercase">Còn lại</label>
                            <div className="text-lg font-bold text-red-700">{new Intl.NumberFormat('vi-VN').format(formData.remaining_amount)} VND</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab 4: Ghi chú */}
            <div className={activeTab === 'other' ? 'block' : 'hidden'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yêu cầu đặc biệt (Khách)</label>
                        <textarea name="special_requests" value={formData.special_requests} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ăn chay, dị ứng, phòng tầng thấp..."></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú nội bộ (Admin)</label>
                        <textarea name="internal_notes" value={formData.internal_notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50" placeholder="Lưu ý cho điều hành..."></textarea>
                    </div>
                    <InputGroup label="Mã giảm giá (Coupon)" name="coupon_code" placeholder="Nhập mã nếu có" />
                    <InputGroup label="ID Nhân viên Sales" name="sales_person_id" type="number" />
                </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors">Hủy bỏ</button>
          <button type="submit" form="booking-form" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
            <Save size={18} /> Lưu Booking
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingForm;