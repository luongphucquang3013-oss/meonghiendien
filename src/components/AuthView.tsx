import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { loginUser, registerUser, loginWithGoogle } from '../firebase/service.ts';
import { isFirebaseActive } from '../firebase/config.ts';

interface AuthViewProps {
  onAuthSuccess: () => void;
  logoUrl?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, logoUrl }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onAuthSuccess();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      let msg = err.message || 'Đã có lỗi xảy ra khi đăng nhập bằng Google.';
      if (msg.includes('auth/popup-closed-by-user') || msg.includes('đóng cửa sổ')) {
        msg = 'Bạn đã đóng cửa sổ đăng nhập Google.';
      } else if (msg.includes('auth/popup-blocked')) {
        msg = 'Trình duyệt đã chặn popup. Vui lòng cho phép popup để tiếp tục.';
      } else if (msg.includes('operation-not-allowed')) {
        msg = 'Chức năng Google Sign-in chưa được kích hoạt trong Firebase Authentication.';
      }
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
        }
        await loginUser(email.trim(), password);
      } else {
        if (!fullName.trim()) {
          throw new Error('Vui lòng nhập Họ và Tên thật để lưu vào hồ sơ trường.');
        }
        if (!email.trim() || !password.trim()) {
          throw new Error('Vui lòng nhập Email và Mật khẩu.');
        }
        if (password.length < 6) {
          throw new Error('Mật khẩu cần tối thiểu 6 ký tự.');
        }
        await registerUser(email.trim(), password, fullName.trim(), 'student');
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Đã có lỗi xảy ra trong quá trình xác thực.';
      if (msg.includes('api-key-not-valid') || msg.includes('auth/api-key-not-valid')) {
        msg = 'Lỗi API Key Firebase (auth/api-key-not-valid): Google Cloud chưa cấp quyền Identity Toolkit API cho Key của dự án esp32-test-36152.';
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'Không tìm thấy tài khoản với email này. Vui lòng chuyển sang tab Đăng ký.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Mật khẩu quá yếu, cần ít nhất 6 ký tự.';
      } else if (msg.includes('auth/operation-not-allowed')) {
        msg = 'Phương thức đăng nhập Email/Mật khẩu chưa được Bật trong Firebase Console (Authentication > Sign-in method).';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
      <div className="max-w-md w-full space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          {logoUrl ? (
            <div className="inline-flex w-16 h-16 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-lg shadow-orange-100 overflow-hidden items-center justify-center">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
          ) : (
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white shadow-lg shadow-orange-200 text-3xl">
              🐱⚡
            </div>
          )}
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Mèo Nghiện Điện
          </h2>
          <p className="text-sm font-semibold text-amber-700">
            Ôn Thi & Kiểm Tra Công Nghệ Công Nghiệp
          </p>
          <p className="text-xs text-slate-500">
            Đề thi trắc nghiệm & Đúng/Sai chuẩn GDPT mới nhất
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-200 text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`py-2.5 rounded-xl transition ${
                isLogin
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`py-2.5 rounded-xl transition ${
                !isLogin
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng ký tài khoản
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* If Register: Full name only, role defaults to student */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và Tên thật <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tài khoản đăng ký mặc định là <strong>Học sinh</strong>. Quyền Giáo viên sẽ được kích hoạt trực tiếp từ Firestore Database.
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email trường học <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="giaovien@school.edu.vn hoặc hocsinh@thpt.edu.vn"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Đăng nhập vào hệ thống' : 'Đăng ký tài khoản mới'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-3 pt-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {googleLoading
                  ? 'Đang kết nối tài khoản Google...'
                  : isLogin
                  ? 'Đăng nhập bằng tài khoản Google'
                  : 'Đăng ký nhanh bằng Google'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
