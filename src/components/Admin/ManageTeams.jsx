import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  UploadCloud, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  X,
  Sparkles,
  Trophy,
  Shield,
  Palette,
  UserMinus
} from 'lucide-react';
import { addTeam, updateTeam, deleteTeam, deleteTeamPlayers } from '../../lib/supabase';

const PRESET_COLORS = [
  '#dc2626', // Crimson Red
  '#b91c1c', // Deep Red
  '#991b1b', // Dark Red
  '#d97706', // Gold/Amber
  '#eab308', // Bright Gold
  '#1e3a8a', // Royal Navy
  '#0d9488', // Teal
  '#7c3aed', // Purple
  '#16a34a', // Emerald Green
  '#ea580c', // Orange
];

const PRESET_BADGES = ['⚽', '🏆', '🦁', '🦅', '⚡', '🔥', '👑', '⭐', '🛡️', '⚔️'];

export default function ManageTeams({ teams = [], players = [], matches = [], onTeamsChanged }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);

  // Form State for Add / Edit
  const [name, setName] = useState('');
  const [color, setColor] = useState('#dc2626');
  const [badge, setBadge] = useState('⚽');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [logoFileName, setLogoFileName] = useState('');
  const [logoFileSize, setLogoFileSize] = useState(0);

  // Advanced stats editing in edit mode
  const [stats, setStats] = useState({
    matches_played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [batchTeamId, setBatchTeamId] = useState('');

  // Delete all players for a specific team
  const handleClearTeamPlayers = async (team) => {
    const count = players.filter(p => p.team_id === team.id).length;
    if (count === 0) {
      alert(`${team.name} currently has no registered players.`);
      return;
    }
    const confirmed = window.confirm(`⚠️ DANGER: Delete ALL ${count} players from ${team.name}?\n\nThis will remove all players registered to this squad.`);
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await deleteTeamPlayers(team.id);
      setSuccess(`Successfully deleted all ${count} players from ${team.name}.`);
      if (onTeamsChanged) onTeamsChanged();
    } catch (err) {
      setError(`Failed to delete players: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchClearPlayers = async () => {
    if (!batchTeamId) return;
    const team = teams.find(t => t.id === batchTeamId);
    if (team) {
      await handleClearTeamPlayers(team);
      setBatchTeamId('');
    }
  };

  const resetForm = () => {
    setName('');
    setColor('#dc2626');
    setBadge('⚽');
    setLogoPreview(null);
    setLogoBase64(null);
    setLogoFileName('');
    setLogoFileSize(0);
    setStats({
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    });
    setError(null);
    setEditingTeam(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (team) => {
    resetForm();
    setEditingTeam(team);
    setName(team.name || '');
    setColor(team.color || '#dc2626');
    setBadge(team.badge || '⚽');
    setLogoPreview(team.logo || null);
    setLogoBase64(team.logo || null);
    setStats({
      matches_played: team.matches_played || 0,
      wins: team.wins || 0,
      draws: team.draws || 0,
      losses: team.losses || 0,
      goals_for: team.goals_for || 0,
      goals_against: team.goals_against || 0,
      points: team.points || 0,
    });
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const MAX_SIZE = 500 * 1024; // 500KB limit
    if (file.size > MAX_SIZE) {
      setError(`File size ${(file.size / 1024).toFixed(0)}KB exceeds the 500KB limit. Please choose a smaller image.`);
      return;
    }

    setError(null);
    setLogoFileName(file.name);
    setLogoFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result;
      setLogoPreview(base64);
      setLogoBase64(base64);
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoBase64(null);
    setLogoFileName('');
    setLogoFileSize(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, {
          name: name.trim(),
          color,
          badge,
          logo: logoBase64,
          ...stats,
        });
        setSuccess(`Team "${name}" successfully updated!`);
      } else {
        await addTeam({
          name: name.trim(),
          color,
          badge,
          logo: logoBase64,
        });
        setSuccess(`Team "${name}" created successfully!`);
      }

      setIsAddModalOpen(false);
      resetForm();
      if (onTeamsChanged) onTeamsChanged();
    } catch (err) {
      console.error('Error saving team:', err);
      setError(err.message || 'Failed to save team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTeam) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteTeam(deletingTeam.id);
      setSuccess(`Team "${deletingTeam.name}" was permanently removed.`);
      setDeletingTeam(null);
      if (onTeamsChanged) onTeamsChanged();
    } catch (err) {
      console.error('Error deleting team:', err);
      setError(err.message || 'Failed to delete team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions Bar */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                Squad Control
              </span>
              <span className="text-amber-200/80 text-xs font-semibold">
                {teams.length} Teams Registered
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mt-1">
              Teams Management
            </h2>
            <p className="text-xs sm:text-sm text-red-200/80 mt-1 max-w-xl">
              Add new squads, customize crests and colors, update table statistics, or remove teams from the Morning Cup tournament.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center space-x-2 active:scale-95 transition-all self-start sm:self-center"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Add New Team</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between shadow-sm animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className="text-sm font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-amber-600 hover:text-amber-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && !isAddModalOpen && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Batch Squad Player Deletion Tool */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <UserMinus className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm font-display">Squad Roster Manager: Delete All Players</div>
            <div className="text-xs text-slate-500">Select any squad to clear its entire player roster in one click.</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={batchTeamId}
            onChange={(e) => setBatchTeamId(e.target.value)}
            className="px-3.5 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
          >
            <option value="" className="text-slate-500 font-bold bg-white">-- Select Squad to Clear --</option>
            {teams.map(t => {
              const count = players.filter(p => p.team_id === t.id).length;
              return (
                <option key={t.id} value={t.id} className="text-slate-900 font-bold bg-white">
                  {t.name} ({count} players)
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={handleBatchClearPlayers}
            disabled={!batchTeamId || isSubmitting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Delete All Players</span>
          </button>
        </div>
      </div>

      {/* Teams Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, idx) => {
          const teamPlayers = players.filter(p => p.team_id === team.id);
          const teamMatches = matches.filter(m => m.home_team_id === team.id || m.away_team_id === team.id);
          const gd = (team.goals_for || 0) - (team.goals_against || 0);

          return (
            <div
              key={team.id}
              className="bg-white rounded-3xl p-5 border border-red-100/80 shadow-md hover:shadow-xl hover:border-amber-400/50 transition-all group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.color || '#dc2626' }}
              />

              <div>
                {/* Header with Logo and Action buttons */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center space-x-3 min-w-0">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300 shadow-sm flex-shrink-0 bg-slate-50"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: team.color || '#dc2626' }}
                      >
                        {team.badge || '⚽'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-base font-display truncate group-hover:text-red-700 transition-colors">
                        {team.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span>{teamPlayers.length} Players</span>
                        <span>•</span>
                        <span>{teamMatches.length} Matches</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleClearTeamPlayers(team)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      title={`Delete all ${teamPlayers.length} players from ${team.name}`}
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors"
                      title="Edit Squad Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTeam(team)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      title="Delete Squad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Performance Pill Grid */}
                <div className="mt-4 grid grid-cols-4 gap-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <div className="font-black text-slate-800 text-sm">{team.points || 0}</div>
                    <div className="text-[10px] uppercase font-bold text-amber-700">Pts</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">{team.matches_played || 0}</div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">P</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">
                      {team.wins || 0}/{team.draws || 0}/{team.losses || 0}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">W-D-L</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">
                      {gd > 0 ? `+${gd}` : gd}
                    </div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">GD</div>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: team.color || '#dc2626' }} />
                  <span className="font-medium text-slate-600">Color Tag</span>
                </span>
                <span className="font-semibold text-slate-600">
                  GF: {team.goals_for || 0} | GA: {team.goals_against || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Team Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-amber-300 relative p-6 sm:p-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-display">
                    {editingTeam ? 'Edit Team Details' : 'Add New Team'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingTeam ? `Editing squad for ${editingTeam.name}` : 'Register a new squad to the tournament'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {/* Team Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dawn Strikers FC"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                />
              </div>

              {/* Team Logo Upload with Preview & Size Limit */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Squad Crest / Logo <span className="text-slate-400 font-normal">(Max 500 KB)</span>
                </label>

                {logoPreview ? (
                  <div className="flex items-center space-x-4 p-3 bg-amber-50/60 border border-amber-200 rounded-2xl">
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {logoFileName || 'Custom Logo Attached'}
                      </div>
                      {logoFileSize > 0 && (
                        <div className="text-[11px] text-amber-700 font-medium">
                          {(logoFileSize / 1024).toFixed(1)} KB (Within 500KB limit)
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="mt-1 text-xs text-red-600 hover:text-red-800 font-semibold underline"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition-all text-center group">
                    <UploadCloud className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-bold text-slate-700">Click to upload team logo</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, SVG, WebP up to 500KB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Team Color Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Brand Color
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-xl transition-all shadow-sm ${
                          color === c ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                    title="Custom color picker"
                  />
                </div>
              </div>

              {/* Badge Icon Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Badge Emoji / Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BADGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBadge(b)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        badge === b
                          ? 'bg-amber-100 border-2 border-amber-500 scale-110 shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* If editing: allow adjusting stats */}
              {editingTeam && (
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                    Table Statistics (Optional Adjustments)
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Points</span>
                      <input
                        type="number"
                        min="0"
                        value={stats.points}
                        onChange={(e) => setStats({ ...stats, points: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-bold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Played</span>
                      <input
                        type="number"
                        min="0"
                        value={stats.matches_played}
                        onChange={(e) => setStats({ ...stats, matches_played: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Wins</span>
                      <input
                        type="number"
                        min="0"
                        value={stats.wins}
                        onChange={(e) => setStats({ ...stats, wins: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Draws</span>
                      <input
                        type="number"
                        min="0"
                        value={stats.draws}
                        onChange={(e) => setStats({ ...stats, draws: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Losses</span>
                      <input
                        type="number"
                        min="0"
                        value={stats.losses}
                        onChange={(e) => setStats({ ...stats, losses: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Goals For</span>
                      <input
                        type="number"
                        min="0"
                        value={stats.goals_for}
                        onChange={(e) => setStats({ ...stats, goals_for: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-center"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Goals Against</span>
                      <input
                        type="number"
                        min="0"
                        value={stats.goals_against}
                        onChange={(e) => setStats({ ...stats, goals_against: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingTeam ? 'Save Changes' : 'Create Team')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center font-display">
              Delete Squad "{deletingTeam.name}"?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mt-2 leading-relaxed">
              This will permanently delete this team, along with its scheduled matches, results, and assigned squad players. This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeletingTeam(null)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
