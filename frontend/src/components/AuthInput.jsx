import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthInput = ({ label, icon: Icon, type = "text", name, value, onChange, placeholder, required, error, togglePassword }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-400 ml-1 transition-colors duration-300">
        {label}
      </label>
      <div className="relative group">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${isFocused ? 'text-primary-400' : 'text-slate-500'}`}>
          <Icon size={20} />
        </div>
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border-2 rounded-2xl outline-none transition-all duration-300 text-white placeholder:text-slate-600
            ${isFocused 
              ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
              : 'border-slate-800 hover:border-slate-700'
            }
          `}
        />

        {togglePassword && (
          <button
            type="button"
            onClick={togglePassword.action}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-400 transition-colors z-10"
          >
            {togglePassword.icon}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-medium text-rose-500 ml-1 mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthInput;
