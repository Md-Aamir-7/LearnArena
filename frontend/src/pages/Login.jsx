import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Gamepad2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthInput from '../components/AuthInput';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) navigate('/');
  }, [user, loading, navigate]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    try {
      await googleLogin(res.credential);
      toast.success('Google Login successful!');
      navigate('/');
    } catch (err) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Left Panel: Cinematic Visuals */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="auth-panel-visual"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Floating Particles */}
        <div className="floating-particle w-32 h-32 top-1/4 left-1/4" style={{"--duration": "8s"}}></div>
        <div className="floating-particle w-48 h-48 bottom-1/4 right-1/4 bg-purple-500/20" style={{"--duration": "12s"}}></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-primary-500 rounded-3xl mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]"
          >
            <Gamepad2 size={48} className="text-white" />
          </motion.div>
          <h1 className="text-6xl font-black mb-4 text-gaming-gradient tracking-tighter">EduPlay</h1>
          <p className="text-xl text-slate-400 max-w-md font-medium">
            Learn through the ultimate gamified experience.
            <span className="text-primary-400 block mt-2 flex items-center justify-center gap-2">
              <Sparkles size={18} /> Learn. Play. Level Up.
            </span>
          </p>
        </div>

        {/* Stats Preview */}
        <div className="mt-16 grid grid-cols-2 gap-6 w-full max-w-sm">
          {[ {l: 'Active Users', v: '12K+'}, {l: 'Quizzes', v: '1.2K+'} ].map((s, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center">
              <p className="text-2xl font-bold text-white">{s.v}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">{s.l}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right Panel: Form */}
      <div className="auth-panel-form">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="auth-glass-card"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
            <p className="text-slate-400">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AuthInput 
              label="Email"
              icon={Mail}
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />

            <AuthInput 
              label="Password"
              icon={Lock}
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={onChange}
              placeholder="Enter your password"
              required
              togglePassword={{
                icon: showPassword ? <EyeOff size={20} /> : <Eye size={20} />,
                action: () => setShowPassword(!showPassword)
              }}
            />

            <div className="flex items-center justify-between text-sm mt-[-8px]">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary-500 focus:ring-primary-500" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" size={18} className="text-primary-400 hover:text-primary-300 font-bold">Forgot Password?</Link>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="auth-gaming-btn mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Login <ArrowRight size={22} />
                </>
              )}
            </motion.button>
          </form>

          <div className="auth-divider my-8">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              theme="filled_blue"
              shape="pill"
              width="100%"
            />
          </div>

          <p className="text-center mt-8 text-slate-400">
            Don't have an account? <Link to="/register" className="text-primary-400 font-bold hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
