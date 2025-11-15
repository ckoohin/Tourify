import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Thêm icon loading
// import { toast } from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();

  // --- THÊM LOGIC STATE ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State cho Phản hồi UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- THÊM LOGIC SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form tải lại trang
    setLoading(true);
    setError(null);

    // (Kiểm tra thêm nếu cần, ví dụ: mật khẩu > 6 ký tự)
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    try {
      // 1. Gọi API Backend (BE)
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      // 2. Xử lý phản hồi
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }

      // 3. Đăng ký thành công
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      // toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      
      // 4. Chuyển hướng về trang Login
      navigate('/login');

    } catch (err) {
      // 5. Xử lý lỗi (ví dụ: Email đã tồn tại)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold text-slate-800 mb-6">
        Tạo tài khoản
      </h2>
      
      {/* --- CẬP NHẬT FORM --- */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        
        {/* Hiển thị lỗi (nếu có) */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Tên (Đã kiểm soát) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Họ và Tên
          </label>
          <input 
            type="text" 
            id="name" 
            placeholder="Nguyễn Văn A" 
            className="block w-full text-sm border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-primary focus:border-primary" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
        </div>
        
        {/* Email (Đã kiểm soát) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input 
            type="email" 
            id="email" 
            placeholder="admin@tourify.com" 
            className="block w-full text-sm border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-primary focus:border-primary" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>

        {/* Mật khẩu (Đã kiểm soát) */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input 
            type="password" 
            id="password" 
            placeholder="•••••••• (Ít nhất 6 ký tự)" 
            className="block w-full text-sm border-slate-300 rounded-lg shadow-sm p-2.5 focus:ring-primary focus:border-primary" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>

        {/* Submit Button (Thêm logic loading) */}
        <button
          type="submit"
          className="w-full px-5 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm
                     disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center" // 👈 Thêm class disabled
          disabled={loading} 
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" /> 
          ) : (
            'Đăng ký' 
          )}
        </button>

        {/* Link to Login */}
        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </>
  );
}