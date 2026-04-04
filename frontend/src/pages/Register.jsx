import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff, UserPlus, Zap, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthInput from '../components/AuthInput';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, googleLogin, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) navigate('/');
  }, [user, loading, navigate]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (formData.username.length < 3) return toast.error('Username must be at least 3 characters');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    try {
      await googleLogin(res.credential);
      toast.success('Google registration successful!');
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
        style={{ background: 'radial-gradient(circle at top left, #a855f7 0%, transparent 40%), radial-gradient(circle at bottom right, #3b82f6 0%, transparent 40%), linear-gradient(135deg, #020617 0%, #1e1b4b 100%)' }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        <div className="floating-particle w-40 h-40 top-1/3 left-1/4 bg-purple-500/20" style={{"--duration": "10s"}}></div>
        <div className="floating-particle w-64 h-64 bottom-1/3 right-1/4 bg-blue-500/20" style={{"--duration": "15s"}}></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-purple-600 rounded-3xl mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)]"
          >
            <Rocket size={48} className="text-white" />
          </motion.div>
          <h1 className="text-6xl font-black mb-4 text-gaming-gradient tracking-tighter">Join EduPlay</h1>
          <p className="text-xl text-slate-400 max-w-md font-medium">
            Start your learning adventure today.
            <span className="text-purple-400 block mt-2 flex items-center justify-center gap-2">
              <Zap size={18} /> Level up your knowledge!
            </span>
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 w-full max-w-sm">
          {[ {l: 'Challenges', v: '500+'}, {l: 'Badges', v: '150+'} ].map((s, i) => (
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
          className="auth-glass-card !max-w-[520px]"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Join our community of learners.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthInput 
              label="Username"
              icon={User}
              name="username"
              value={formData.username}
              onChange={onChange}
              placeholder="Pick a username"
              required
            />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AuthInput 
                label="Password"
                icon={Lock}
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={onChange}
                placeholder="Password"
                required
                togglePassword={{
                  icon: showPassword ? <EyeOff size={20} /> : <Eye size={20} />,
                  action: () => setShowPassword(!showPassword)
                }}
              />
              <AuthInput 
                label="Confirm Password"
                icon={ShieldCheck}
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={onChange}
                placeholder="Confirm"
                required
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="auth-gaming-btn mt-4 !bg-gradient-to-br from-purple-600 to-indigo-700 !shadow-purple-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account <UserPlus size={22} />
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
              theme="outline"
              shape="pill"
              width="100%"
            />
          </div>

          <p className="text-center mt-8 text-slate-400">
            Already have an account? <Link to="/login" className="text-primary-400 font-bold hover:underline">Login here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
