import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, ArrowRight, Loader2, UserPlus, Briefcase } from 'lucide-react';
import InputField from '../../components/common/InputField'; 

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'guide' 
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Mật khẩu quá ngắn (tối thiểu 6 ký tự)');
      return;
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
        toast.error('Số điện thoại không hợp lệ');
        return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email.");
      navigate('/login'); 

    } catch (err) {
      console.error("Register Error:", err);
      
      const status = err.response?.status;
      const resData = err.response?.data;
      const serverMessage = resData?.message || "";

      if (status === 500 && (serverMessage === 'Could not send email' || serverMessage.includes('email'))) {
          toast.success("Đăng ký tài khoản thành công!");
          toast("Hệ thống email đang bảo trì, bạn có thể đăng nhập ngay.", {
            icon: 'ℹ️',
            style: { background: '#FFFBEB', color: '#B45309', border: '1px solid #FCD34D' },
            duration: 5000
          });
          navigate('/login'); 
          return;
      }

      let errorMessage = 'Đăng ký thất bại';
      if (resData?.errors && Array.isArray(resData.errors)) {
         errorMessage = resData.errors.map(e => `- ${e.msg || e.message}`).join('\n');
      } else if (resData?.message) {
         errorMessage = resData.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6 shadow-sm">
          <UserPlus size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tạo tài khoản</h2>
        <p className="mt-2 text-slate-500">Đăng ký để trở thành đối tác của Tourify</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase size={20} />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white appearance-none cursor-pointer"
              required
            >
              <option value="guide">Hướng dẫn viên (Tour Guide)</option>
              <option value="supplier">Nhà cung cấp (Supplier)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <InputField 
            icon={User} 
            type="text" 
            name="name" 
            placeholder="Họ và tên đầy đủ" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
          
          <InputField 
            icon={Mail} 
            type="email" 
            name="email" 
            placeholder="Địa chỉ Email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          
          <InputField 
            icon={Phone} 
            type="tel" 
            name="phone" 
            placeholder="Số điện thoại" 
            value={formData.phone} 
            onChange={handleChange} 
            pattern="[0-9]{10}" 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField 
                icon={Lock} 
                type="password" 
                name="password" 
                placeholder="Mật khẩu" 
                value={formData.password} 
                onChange={handleChange} 
                required 
            />
            <InputField 
                icon={Lock} 
                type="password" 
                name="confirmPassword" 
                placeholder="Xác nhận" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Đăng ký ngay <ArrowRight size={20}/></>}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400">Đã có tài khoản?</span></div>
        </div>
        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 transition-colors hover:underline text-base">
          Đăng nhập tại đây
        </Link>
      </div>
    </>
  );
};

export default Register;