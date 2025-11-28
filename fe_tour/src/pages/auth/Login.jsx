import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2, LogIn } from 'lucide-react';
import InputField from '../../components/common/InputField'; 

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation()
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || "/dashboard";
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success("Đăng nhập thành công!");
      navigate('/dashboard', { replace: true }); 
    } catch (err) {
      console.error("Login Error:", err);
      const resData = err.response?.data;
      let msg = resData?.message || err.message || 'Đăng nhập thất bại';
      
      if (resData?.errors && Array.isArray(resData.errors)) {
         msg = resData.errors.map(e => `- ${e.msg || e.message}`).join('\n');
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6 shadow-sm">
          <LogIn size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Đăng nhập</h2>
        <p className="mt-2 text-slate-500">Nhập email và mật khẩu của bạn</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
            <InputField 
                icon={Mail} 
                type="email" 
                name="email" 
                placeholder="Địa chỉ Email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
            />
            
            <div>
                <InputField 
                    icon={Lock} 
                    type="password" 
                    name="password" 
                    placeholder="Mật khẩu" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                />
                <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline">
                        Quên mật khẩu?
                    </Link>
                </div>
            </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <>Đăng nhập <ArrowRight size={20}/></>}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="mt-10 text-center">
        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400">Chưa có tài khoản?</span></div>
        </div>
        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors hover:underline text-base">
          Đăng ký ngay
        </Link>
      </div>
    </>
  );
};

export default Login;