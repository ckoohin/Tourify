import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Thêm icon loading

// import { useAuth } from '../../context/AuthContext'; 

export default function Login() {
  const navigate = useNavigate();
  // const { login } = useAuth(); // (Sẽ dùng khi có AuthContext)

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

    try {
      // 1. Gọi API Backend (BE)
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 2. Xử lý phản hồi
      if (!response.ok) {
        // Nếu BE trả về lỗi (ví dụ: 401, 404)
        throw new Error(data.message || 'Email hoặc mật khẩu không chính xác.');
      }

      // 3. Đăng nhập thành công

      localStorage.setItem('token', data.token); // (Cách làm đơn giản)

      // 4. Chuyển hướng về Dashboard
      navigate('/dashboard');

    } catch (err) {
      // 5. Xử lý lỗi
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold text-slate-800 mb-1">
        Chào mừng trở lại!
      </h2>
      <p className="text-center text-sm text-slate-500 mb-6">
        Đăng nhập vào hệ thống quản trị Tourify.
      </p>

      {/* --- CẬP NHẬT FORM --- */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        
        {/* Hiển thị lỗi (nếu có) */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Email Input (Đã kiểm soát) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <div className="relative">
            {/* ... (icon) ... */}
            <input
              type="email"
              id="email"
              placeholder="admin@tourify.com"
              className="block w-full text-sm border-slate-300 rounded-lg shadow-sm pl-10 p-2.5 focus:ring-primary focus:border-primary"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
        </div>

        {/* Password Input (Đã kiểm soát) */}
        <div>
          {/* ... (label) ... */}
          <div className="relative">
            {/* ... (icon) ... */}
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="block w-full text-sm border-slate-300 rounded-lg shadow-sm pl-10 p-2.5 focus:ring-primary focus:border-primary"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
        </div>

        {/* Submit Button (Thêm logic loading) */}
        <button
          type="submit"
          className="w-full px-5 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors shadow-sm
                     disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center" // 👈 Thêm class disabled
          disabled={loading} 
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" /> 
          ) : (
            'Đăng nhập' 
          )}
        </button>

        {/* ... (Link to Register) ... */}
      </form>
    </>
  );
}