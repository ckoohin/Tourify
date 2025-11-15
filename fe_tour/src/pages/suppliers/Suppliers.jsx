import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Filter, Building2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/v1/supplier'; 

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    code: '',
    type: 'hotel',
    company_name: '',
    tax_code: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    website: '',
    rating: '',
    total_bookings: '',
    payment_terms: '',
    credit_limit: '',
    status: 'active',
    notes: ''
  });

  const supplierTypes = [
    { value: 'hotel', label: 'Khách sạn' },
    { value: 'restaurant', label: 'Nhà hàng' },
    { value: 'transport', label: 'Vận chuyển' },
    { value: 'attraction', label: 'Điểm tham quan' },
    { value: 'visa', label: 'Visa' },
    { value: 'insurance', label: 'Bảo hiểm' },
    { value: 'other', label: 'Khác' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' },
    { value: 'blacklist', label: 'Danh sách đen', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, filterType, filterStatus]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.success) {
        setSuppliers(result.data.suppliers);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    setFilteredSuppliers(filtered);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Mã code không được để trống';
    } else if (formData.code.length > 11) {
      newErrors.code = 'Mã code tối đa 11 ký tự';
    }

    if (!formData.type) {
      newErrors.type = 'Loại nhà cung cấp không được để trống';
    }

    if (!formData.company_name?.trim()) {
      newErrors.company_name = 'Tên nhà cung cấp không được để trống';
    } else if (formData.company_name.length > 255) {
      newErrors.company_name = 'Tên nhà cung cấp tối đa 255 ký tự';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (formData.phone.length > 20) {
      newErrors.phone = 'Số điện thoại tối đa 20 ký tự';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = editingSupplier 
        ? `${API_URL}/${editingSupplier.id}` 
        : API_URL;
      
      const method = editingSupplier ? 'PUT' : 'POST';

      const cleanData = {
        ...formData,
        total_bookings: formData.total_bookings !== '' ? Number(formData.total_bookings) : null,
        rating: formData.rating !== '' ? Number(formData.rating) : null,
        credit_limit: formData.credit_limit !== '' ? Number(formData.credit_limit) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });

      const result = await response.json();

      if (result.success) {
        await fetchSuppliers();
        handleCloseModal();
      } else {
        if (result.errors) {
          const formErrors = {};
          result.errors.forEach(err => {
            formErrors[err.path] = err.msg;
          });
          setErrors(formErrors);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu nhà cung cấp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${deletingSupplier.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await fetchSuppliers();
        setIsDeleteModalOpen(false);
        setDeletingSupplier(null);
      }
    } catch (error) {
      console.error('Lỗi khi xóa nhà cung cấp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code || '',
      type: supplier.type || 'hotel',
      company_name: supplier.company_name || '',
      tax_code: supplier.tax_code || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      website: supplier.website || '',
      rating: supplier.rating || '',
      total_bookings: supplier.total_bookings || '',
      payment_terms: supplier.payment_terms || '',
      credit_limit: supplier.credit_limit || '',
      status: supplier.status || 'active',
      notes: supplier.notes || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData({
      code: '',
      type: 'hotel',
      company_name: '',
      tax_code: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      website: '',
      rating: '',
      total_bookings: '',
      payment_terms: '',
      credit_limit: '',
      status: 'active',
      notes: ''
    });
    setErrors({});
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOption?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusOption?.label || status}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    return supplierTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản Lý Nhà Cung Cấp</h1>
                <p className="text-gray-500 text-sm">Tổng số: {filteredSuppliers.length} nhà cung cấp</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              Thêm Nhà Cung Cấp
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại</option>
              {supplierTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Mã</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tên Công Ty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Loại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Liên Hệ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Địa Chỉ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng Thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy nhà cung cấp nào
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.code}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{supplier.company_name}</div>
                        {supplier.tax_code && (
                          <div className="text-xs text-gray-500">MST: {supplier.tax_code}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getTypeLabel(supplier.type)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{supplier.phone}</div>
                        {supplier.email && (
                          <div className="text-xs text-gray-500">{supplier.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.city && supplier.country 
                          ? `${supplier.city}, ${supplier.country}` 
                          : supplier.city || supplier.country || '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(supplier.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingSupplier(supplier);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold">
                {editingSupplier ? 'Cập Nhật Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="VD: SUP001"
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {supplierTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Company Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Công Ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.company_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tên nhà cung cấp"
                  />
                  {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                </div>

                {/* Tax Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã Số Thuế</label>
                  <input
                    type="text"
                    value={formData.tax_code}
                    onChange={(e) => setFormData({...formData, tax_code: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mã số thuế"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Người Liên Hệ</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tên người liên hệ"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Số điện thoại"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa Chỉ</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Địa chỉ chi tiết"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thành Phố</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Thành phố"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quốc Gia</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Quốc gia"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điều Khoản Thanh Toán</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: Net 30"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi Chú</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ghi chú thêm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Đang lưu...' : editingSupplier ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Xác Nhận Xóa</h3>
            <p className="text-center text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa nhà cung cấp <strong>{deletingSupplier?.company_name}</strong>? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingSupplier(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;