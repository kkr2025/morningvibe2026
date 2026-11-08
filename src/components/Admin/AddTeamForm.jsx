import React, { useState } from 'react';
import { Shield, Plus, CheckCircle2, AlertCircle, Upload, X, Image } from 'lucide-react';
import { addTeam } from '../../lib/supabase';

const PRESET_BADGES = ['⚽', '🌅', '🦅', '⚡', '🌸', '💧', '☀️', '🦁', '🔥', '🛡️', '🌟', '🚀'];
const PRESET_COLORS = ['#16a34a', '#0284c7', '#d97706', '#9333ea', '#0d9488', '#e11d48', '#4f46e5', '#334155'];
const MAX_SIZE = 512000; // 500 KB

export default function AddTeamForm({ onTeamAdded }) {
  const [name, setName] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('⚽');
  const [selectedColor, setSelectedColor] = useState('#16a34a');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Logo upload states
  const [logoBase64, setLogoBase64] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFileName, setLogoFileName] = useState('');
  const [logoFileSize, setLogoFileSize] = useState(0);
  const [logoError, setLogoError] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('Only image files are allowed (JPG, PNG, GIF, WebP, SVG).');
      return;
    }
    if (file.size > MAX_SIZE) {
      setLogoError(`Image too large: ${(file.size / 1024).toFixed(0)} KB. Maximum allowed: 500 KB.`);
      return;
    }

    setLogoError('');
    setLogoFileName(file.name);
    setLogoFileSize(file.size);

    // Live preview via object URL
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => setLogoBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoBase64(null);
    setLogoPreview(null);
    setLogoFileName('');
    setLogoFileSize(0);
    setLogoError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a team name.' });
      return;
    }
    try {
      setIsLoading(true);
      setMessage(null);
      await addTeam({
        name: name.trim(),
        badge: selectedBadge,
        color: selectedColor,
        logo: logoBase64 || null,
      });
      setMessage({ type: 'success', text: `Team "${name.trim()}" successfully created!` });
      setName('');
      setLogoBase64(null);
      setLogoPreview(null);
      setLogoFileName('');
      setLogoFileSize(0);
      if (onTeamAdded) onTeamAdded();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add team.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">Add New Team</h3>
          <p className="text-xs text-slate-500">Register a squad with a custom logo, badge, and colour.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Team Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Team Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Dawn Strikers FC"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            required
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Team Logo <span className="text-slate-400 font-normal normal-case">(optional · max 500 KB)</span>
          </label>

          <div className="flex items-start space-x-4">
            {/* Preview Box */}
            <div
              className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 overflow-hidden transition-all ${
                logoPreview
                  ? 'border-emerald-400 shadow-md shadow-emerald-200'
                  : logoError
                  ? 'border-rose-400'
                  : 'border-dashed border-slate-300 bg-slate-50'
              }`}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Team logo preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl">{selectedBadge}</div>
                  <div className="text-[9px] text-slate-400 mt-1">Preview</div>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-2">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{logoPreview ? 'Change Image' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>

              {logoFileName && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 text-[11px] text-slate-500 truncate">
                    <span className="font-semibold text-slate-700">{logoFileName}</span>
                    <span className="ml-1">· {(logoFileSize / 1024).toFixed(0)} KB</span>
                    {logoBase64 && <span className="ml-1 text-emerald-600 font-bold">✓ Ready</span>}
                  </div>
                  <button type="button" onClick={handleRemoveLogo} className="text-slate-400 hover:text-rose-500 transition-colors p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {logoError && (
                <div className="flex items-center space-x-1 text-[11px] text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{logoError}</span>
                </div>
              )}

              {!logoFileName && !logoError && (
                <p className="text-[11px] text-slate-400">JPG, PNG, GIF, WebP or SVG accepted.</p>
              )}
            </div>
          </div>
        </div>

        {/* Badge & Color Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Fallback Badge</label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {PRESET_BADGES.map(b => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setSelectedBadge(b)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${selectedBadge === b ? 'bg-emerald-600 text-white shadow scale-110' : 'hover:bg-slate-200'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Theme Colour</label>
            <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !!logoError}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{isLoading ? 'Creating Team...' : 'Create Team'}</span>
        </button>
      </form>
    </div>
  );
}
