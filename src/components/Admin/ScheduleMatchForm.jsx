import React, { useState } from 'react';
import { CalendarPlus, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { scheduleMatch } from '../../lib/supabase';

export default function ScheduleMatchForm({ teams = [], onMatchScheduled }) {
  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || '');
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || '');
  
  // Default to tomorrow 7:00 AM
  const getTomorrowMorning = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const [matchTime, setMatchTime] = useState(getTomorrowMorning());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Sync default team selection
  React.useEffect(() => {
    if (teams.length >= 2) {
      if (!homeTeamId) setHomeTeamId(teams[0].id);
      if (!awayTeamId) setAwayTeamId(teams[1].id);
    }
  }, [teams, homeTeamId, awayTeamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) {
      setMessage({ type: 'error', text: 'Please select both Home and Away squads.' });
      return;
    }
    if (homeTeamId === awayTeamId) {
      setMessage({ type: 'error', text: 'A team cannot play against itself. Please choose two distinct teams.' });
      return;
    }
    if (!matchTime) {
      setMessage({ type: 'error', text: 'Please choose match date and kickoff time.' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);
      await scheduleMatch({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_time: matchTime
      });

      const homeName = teams.find(t => t.id === homeTeamId)?.name || 'Home Team';
      const awayName = teams.find(t => t.id === awayTeamId)?.name || 'Away Team';

      setMessage({ 
        type: 'success', 
        text: `Match scheduled: ${homeName} vs ${awayName}!` 
      });

      if (onMatchScheduled) onMatchScheduled();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to schedule match.' });
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetTime = (daysAhead, hours, minutes) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hours, minutes, 0, 0);
    setMatchTime(d.toISOString().slice(0, 16));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
          <CalendarPlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">
            Schedule Match
          </h3>
          <p className="text-xs text-slate-500">
            Set up fixtures with kickoff datetime for Morning Cup matchweeks.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Teams Matchup Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Home Team */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Home Squad *
            </label>
            <select
              value={homeTeamId}
              onChange={(e) => setHomeTeamId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === awayTeamId}>
                  {t.name} {t.id === awayTeamId ? '(Already selected as Away)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Away Team */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Away Squad *
            </label>
            <select
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              required
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === homeTeamId}>
                  {t.name} {t.id === homeTeamId ? '(Already selected as Home)' : ''}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Date Time Local Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Match Kickoff Time (<code className="text-emerald-700">&lt;input type="datetime-local"&gt;</code>) *
          </label>
          <input
            type="datetime-local"
            value={matchTime}
            onChange={(e) => setMatchTime(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
            required
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick presets:</span>
            <button
              type="button"
              onClick={() => setPresetTime(1, 7, 0)}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
            >
              Tomorrow 7:00 AM
            </button>
            <button
              type="button"
              onClick={() => setPresetTime(2, 6, 30)}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
            >
              +2 Days 6:30 AM
            </button>
            <button
              type="button"
              onClick={() => setPresetTime(7, 7, 30)}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
            >
              Next Weekend 7:30 AM
            </button>
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
          disabled={isLoading || teams.length < 2}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{isLoading ? 'Scheduling...' : 'Schedule Match'}</span>
        </button>
      </form>
    </div>
  );
}
