import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  Save, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  UserX, 
  Plus, 
  Trash2, 
  Trophy, 
  X,
  Search,
  CheckCircle2
} from 'lucide-react';
import { 
  getDisciplinarySettings, 
  saveDisciplinarySettings, 
  updatePlayerDiscipline, 
  clearAllSuspensions 
} from '../../lib/supabase';

export default function DisciplinarySettings({ players = [], teams = [], matches = [], onDataChanged }) {
  const currentSettings = getDisciplinarySettings();

  const [yellowLimit, setYellowLimit] = useState(currentSettings.yellow_card_limit || 2);
  const [redBanDuration, setRedBanDuration] = useState(currentSettings.red_card_suspension_matches || 2);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Manual Card Assigner State
  const [targetTeamId, setTargetTeamId] = useState(teams[0]?.id || '');
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [cardType, setCardType] = useState('yellow'); // 'yellow' or 'red'
  const [customReason, setCustomReason] = useState('');

  // Player Search for quick edits
  const [searchPlayer, setSearchPlayer] = useState('');

  const teamPlayers = players.filter(p => p.team_id === targetTeamId);

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = saveDisciplinarySettings({
        yellow_card_limit: parseInt(yellowLimit, 10) || 2,
        red_card_suspension_matches: parseInt(redBanDuration, 10) || 2,
      });

      setSuccess(`Disciplinary rules saved! (${updated.yellow_card_limit} Yellows = 1 Match Ban, Red = ${updated.red_card_suspension_matches} Match Ban)`);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset all suspensions
  const handleClearSuspensions = async () => {
    const ok = window.confirm('Are you sure you want to clear all active suspensions across all teams?');
    if (!ok) return;

    setIsSubmitting(true);
    try {
      await clearAllSuspensions();
      setSuccess('All player suspensions have been cleared!');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setError('Failed to clear suspensions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Award card to player
  const handleAwardCard = async (e) => {
    e.preventDefault();
    if (!targetPlayerId) {
      setError('Please select a player to award a card.');
      return;
    }

    const player = players.find(p => p.id === targetPlayerId);
    if (!player) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let updatedYellows = player.yellow_cards || 0;
      let updatedReds = player.red_cards || 0;
      let isSuspended = player.is_suspended || false;
      let remaining = player.suspension_matches_remaining || 0;
      let reason = player.suspension_reason || '';

      if (cardType === 'yellow') {
        updatedYellows += 1;
        if (updatedYellows >= yellowLimit && (updatedYellows % yellowLimit === 0)) {
          isSuspended = true;
          remaining = 1;
          reason = `Suspended for next match (${updatedYellows} Yellow Cards accumulated)`;
        }
      } else {
        updatedReds += 1;
        isSuspended = true;
        remaining = redBanDuration;
        reason = `Suspended for next ${redBanDuration} matches (Direct Red Card)`;
      }

      await updatePlayerDiscipline(targetPlayerId, {
        yellow_cards: updatedYellows,
        red_cards: updatedReds,
        is_suspended: isSuspended,
        suspension_matches_remaining: remaining,
        suspension_reason: reason,
      });

      setSuccess(`Recorded ${cardType === 'yellow' ? '🟨 Yellow Card' : '🟥 Red Card'} for ${player.name}! ${isSuspended ? '⛔ Player is now suspended.' : ''}`);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setError(err.message || 'Failed to award card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick toggle suspension on any player
  const handleToggleSuspension = async (player) => {
    setIsSubmitting(true);
    try {
      const willSuspend = !player.is_suspended;
      await updatePlayerDiscipline(player.id, {
        is_suspended: willSuspend,
        suspension_matches_remaining: willSuspend ? 1 : 0,
        suspension_reason: willSuspend ? 'Manual suspension by Admin' : '',
      });
      setSuccess(`${player.name} is now ${willSuspend ? '⛔ Suspended' : '✅ Eligible'}.`);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setError('Failed to update suspension status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlayers = players.filter(p => {
    if (!searchPlayer) return true;
    const term = searchPlayer.toLowerCase();
    const t = teams.find(team => team.id === p.team_id)?.name || '';
    return p.name.toLowerCase().includes(term) || t.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-amber-500/30">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-red-950 flex items-center justify-center shadow-md flex-shrink-0">
            <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center space-x-2">
              <span>Disciplinary & Card Suspension Settings</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80 mt-0.5">
              Configure custom yellow & red card suspension thresholds and track matchday player bans.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-amber-700 hover:text-amber-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. CUSTOM SUSPENSION RULES SETTINGS FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-red-100 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-slate-900 text-base sm:text-lg font-display">
              Custom Suspension Rules
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClearSuspensions}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Active Suspensions</span>
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Yellow Card Threshold */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <label className="block text-xs font-black uppercase text-amber-900 mb-1">
              Yellow Cards Ban Threshold
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              How many accumulated yellow cards result in a 1-match suspension?
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="5"
                value={yellowLimit}
                onChange={(e) => setYellowLimit(e.target.value)}
                className="w-24 px-3 py-2 border-2 border-amber-300 rounded-xl text-base font-black text-center text-slate-900 bg-white"
              />
              <span className="text-xs font-bold text-slate-700">
                Yellow Cards ➔ 1 Match Suspension
              </span>
            </div>
          </div>

          {/* Red Card Suspension Duration */}
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200">
            <label className="block text-xs font-black uppercase text-red-900 mb-1">
              Direct Red Card Suspension Duration
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              How many matches is a player banned when receiving a direct red card?
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="1"
                max="5"
                value={redBanDuration}
                onChange={(e) => setRedBanDuration(e.target.value)}
                className="w-24 px-3 py-2 border-2 border-red-300 rounded-xl text-base font-black text-center text-slate-900 bg-white"
              />
              <span className="text-xs font-bold text-slate-700">
                Matches Suspended for Direct Red
              </span>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 text-white font-black text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Suspension Rules'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* 2. QUICK CARD ASSIGNMENT FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-red-100 shadow-md">
        <h3 className="font-black text-slate-900 text-base sm:text-lg font-display mb-1 flex items-center space-x-2">
          <span>Award Card to Player</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Directly log a disciplinary yellow or red card onto any tournament squad member.
        </p>

        <form onSubmit={handleAwardCard} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          
          {/* Select Squad */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Select Squad
            </label>
            <select
              value={targetTeamId}
              onChange={(e) => {
                setTargetTeamId(e.target.value);
                setTargetPlayerId('');
              }}
              className="w-full px-3 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id} className="text-slate-900 font-bold bg-white">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Select Player */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Select Player
            </label>
            <select
              value={targetPlayerId}
              onChange={(e) => setTargetPlayerId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="" className="text-slate-500 font-bold bg-white">-- Choose Player --</option>
              {teamPlayers.map(p => (
                <option key={p.id} value={p.id} className="text-slate-900 font-bold bg-white">
                  {p.name} ({p.role}) {p.is_suspended ? '⛔ Suspended' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Card Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Card Type
            </label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="yellow" className="text-slate-900 font-bold bg-white">🟨 Yellow Card</option>
              <option value="red" className="text-slate-900 font-bold bg-white">🟥 Direct Red Card</option>
            </select>
          </div>

          {/* Award Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !targetPlayerId}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              Award Card
            </button>
          </div>

        </form>
      </div>

      {/* 3. ROSTER DISCIPLINARY TABLE WITH QUICK SUSPENSION TOGGLES */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-red-100 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base font-display">
              All Tournament Players & Suspension Status
            </h3>
            <p className="text-xs text-slate-500">
              Manually toggle match suspensions or review card tallies for all players.
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchPlayer}
              onChange={(e) => setSearchPlayer(e.target.value)}
              placeholder="Filter player or squad..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
          {filteredPlayers.map((player) => {
            const team = teams.find(t => t.id === player.team_id);
            return (
              <div key={player.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                <div className="flex items-center space-x-2.5">
                  <span className="font-black text-slate-800">{player.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{team?.name || '—'}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({player.role})</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-bold text-slate-600">
                    🟨 {player.yellow_cards || 0} | 🟥 {player.red_cards || 0}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleSuspension(player)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-colors ${
                      player.is_suspended
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {player.is_suspended ? '⛔ Suspended (Lift Ban)' : 'Set Suspended'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
