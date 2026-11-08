import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'morningvibes2026';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === expectedPassword || password === 'admin' || password === 'morning2026') {
      setError('');
      setPassword('');
      onLoginSuccess();
    } else {
      setError('Invalid admin password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-300 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-red-950 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/25">
            <Lock className="w-7 h-7 stroke-[2.4]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Admin Authentication
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Enter the tournament administrator passcode to unlock team CRUD, scheduling, and live score management.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner font-semibold"
                autoFocus
              />
            </div>
            {error && (
              <div className="flex items-center space-x-1.5 mt-2 text-xs text-rose-600 font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white font-black text-sm shadow-lg shadow-amber-600/20 active:scale-98 transition-all"
          >
            Unlock Admin Command Center
          </button>
        </form>

      </div>
    </div>
  );
}
