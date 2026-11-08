import React, { useState } from 'react';
import { UserPlus, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { addPlayer } from '../../lib/supabase';

const ROLES = ['Forward', 'Midfielder', 'Center Back', 'Goalkeeper', 'Coach'];

export default function AddPlayerForm({ teams = [], onPlayerAdded }) {
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Forward');
  const [goals, setGoals] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Keep teamId synced if teams change
  React.useEffect(() => {
    if (!teamId && teams.length > 0) {
      setTeamId(teams[0].id);
    }
  }, [teams, teamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamId) {
      setMessage({ type: 'error', text: 'Please select a team for this player.' });
      return;
    }
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please enter the player name.' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);
      await addPlayer({
        team_id: teamId,
        name: name.trim(),
        role,
        goals: Number(goals) || 0
      });

      setMessage({ type: 'success', text: `Player "${name.trim()}" successfully registered to squad!` });
      setName('');
      setGoals(0);
      if (onPlayerAdded) onPlayerAdded();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add player.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">
            Add New Player / Coach
          </h3>
          <p className="text-xs text-slate-500">
            Assign squad members and tactical staff to tournament teams.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Team Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Team *
          </label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            required
          >
            {teams.length === 0 ? (
              <option value="">No teams available (Create a team first)</option>
            ) : (
              teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Player Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Player / Coach Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marcus Sterling"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            required
          />
        </div>

        {/* Role & Initial Goals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              required
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Goals */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Initial Goals
            </label>
            <input
              type="number"
              min="0"
              value={goals}
              onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            />
          </div>

        </div>

        {/* Messages */}
        {message && (
          <div className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || teams.length === 0}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{isLoading ? 'Adding Member...' : 'Register Player'}</span>
        </button>
      </form>
    </div>
  );
}
