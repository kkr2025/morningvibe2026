import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trophy, 
  Flame, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { completeMatchResult } from '../../lib/supabase';
import { formatRelativeMatchTime, triggerMatchConfetti } from '../../lib/utils';

export default function UpdateMatchScoreForm({ 
  matches = [], 
  teams = [], 
  players = [], 
  selectedMatch = null, 
  onMatchCompleted 
}) {
  const scheduledMatches = matches.filter(m => m.status === 'Scheduled');

  const [selectedMatchId, setSelectedMatchId] = useState(
    selectedMatch?.id || (scheduledMatches[0]?.id || '')
  );
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [scorerAssignments, setScorerAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Sync selected match when prop or scheduled list updates
  useEffect(() => {
    if (selectedMatch) {
      setSelectedMatchId(selectedMatch.id);
    } else if (!selectedMatchId && scheduledMatches.length > 0) {
      setSelectedMatchId(scheduledMatches[0].id);
    }
  }, [selectedMatch, scheduledMatches, selectedMatchId]);

  const activeMatch = matches.find(m => m.id === selectedMatchId);
  const homeTeam = activeMatch ? (teams.find(t => t.id === activeMatch.home_team_id) || activeMatch.home_team) : null;
  const awayTeam = activeMatch ? (teams.find(t => t.id === activeMatch.away_team_id) || activeMatch.away_team) : null;

  // Available players for both teams for optional goal crediting
  const matchPlayers = players.filter(p => 
    p.role !== 'Coach' && 
    (p.team_id === activeMatch?.home_team_id || p.team_id === activeMatch?.away_team_id)
  );

  const handleAddGoalToPlayer = (playerId) => {
    setScorerAssignments(prev => {
      const existing = prev.find(item => item.playerId === playerId);
      if (existing) {
        return prev.map(item => item.playerId === playerId ? { ...item, count: item.count + 1 } : item);
      }
      return [...prev, { playerId, count: 1 }];
    });
  };

  const handleRemoveGoalFromPlayer = (playerId) => {
    setScorerAssignments(prev => {
      return prev
        .map(item => item.playerId === playerId ? { ...item, count: item.count - 1 } : item)
        .filter(item => item.count > 0);
    });
  };

  // Outcome preview calculation
  const h = parseInt(homeScore, 10) || 0;
  const a = parseInt(awayScore, 10) || 0;
  let outcomeText = '';
  if (h > a) {
    outcomeText = `${homeTeam?.name || 'Home'} wins (+3 Pts). ${awayTeam?.name || 'Away'} loses (0 Pts).`;
  } else if (a > h) {
    outcomeText = `${awayTeam?.name || 'Away'} wins (+3 Pts). ${homeTeam?.name || 'Home'} loses (0 Pts).`;
  } else {
    outcomeText = `Match is a Draw! Both ${homeTeam?.name || 'Home'} and ${awayTeam?.name || 'Away'} receive +1 Pt.`;
  }

  const handleCompleteMatch = async (e) => {
    e.preventDefault();
    if (!selectedMatchId) {
      setMessage({ type: 'error', text: 'Please select a scheduled match to complete.' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);

      await completeMatchResult({
        matchId: selectedMatchId,
        homeScore: h,
        awayScore: a,
        playerScorers: scorerAssignments
      });

      triggerMatchConfetti();
      setMessage({
        type: 'success',
        text: `Match marked Completed! Standings and goal records automatically updated.`
      });

      setHomeScore(0);
      setAwayScore(0);
      setScorerAssignments([]);

      if (onMatchCompleted) onMatchCompleted();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to complete match.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 mb-5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-display">
            Update Score & Complete Match
          </h3>
          <p className="text-xs text-slate-500">
            Enter final scores and trigger automated league standings & points recalculation.
          </p>
        </div>
      </div>

      {scheduledMatches.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No scheduled matches pending</p>
          <p className="text-xs text-slate-400 mt-1">
            All matches have either been completed or none are currently scheduled. Use the "Schedule Match" tab to set up new fixtures.
          </p>
        </div>
      ) : (
        <form onSubmit={handleCompleteMatch} className="space-y-5">
          
          {/* Match Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Scheduled Match *
            </label>
            <select
              value={selectedMatchId}
              onChange={(e) => {
                setSelectedMatchId(e.target.value);
                setScorerAssignments([]);
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold"
              required
            >
              {scheduledMatches.map((m) => {
                const hName = teams.find(t => t.id === m.home_team_id)?.name || m.home_team?.name || 'Home';
                const aName = teams.find(t => t.id === m.away_team_id)?.name || m.away_team?.name || 'Away';
                return (
                  <option key={m.id} value={m.id}>
                    {hName} vs {aName} ({formatRelativeMatchTime(m.match_time)})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Interactive Scoreboard Input */}
          <div className="bg-gradient-to-br from-slate-900 via-pitch-950 to-slate-900 rounded-2xl p-5 text-white shadow-md">
            <div className="text-center text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-4">
              Enter Final Score
            </div>

            <div className="grid grid-cols-7 items-center gap-3">
              
              {/* Home Team & Score */}
              <div className="col-span-3 text-center sm:text-right">
                <div className="text-sm sm:text-base font-bold text-white truncate mb-2">
                  {homeTeam?.name || 'Home Team'}
                </div>
                <div className="inline-flex items-center justify-center">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-16 h-14 sm:w-20 sm:h-16 text-center text-2xl sm:text-3xl font-black bg-white/10 border-2 border-white/30 rounded-2xl text-white focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="col-span-1 text-center font-black text-xl text-slate-400">
                :
              </div>

              {/* Away Team & Score */}
              <div className="col-span-3 text-center sm:text-left">
                <div className="text-sm sm:text-base font-bold text-white truncate mb-2">
                  {awayTeam?.name || 'Away Team'}
                </div>
                <div className="inline-flex items-center justify-center">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-16 h-14 sm:w-20 sm:h-16 text-center text-2xl sm:text-3xl font-black bg-white/10 border-2 border-white/30 rounded-2xl text-white focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all shadow-inner"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Trigger Outcome Live Preview */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Automated Standings Impact (Trigger Logic):</span>
            </div>
            <p className="text-emerald-800 font-medium leading-relaxed">
              • {outcomeText}
            </p>
            <p className="text-emerald-700 leading-relaxed">
              • Both squads will have <strong>+1 Matches Played</strong> recorded, with <strong>+{h} GF / +{a} GA</strong> for {homeTeam?.name || 'Home'}, and <strong>+{a} GF / +{h} GA</strong> for {awayTeam?.name || 'Away'}.
            </p>
          </div>

          {/* Optional: Credit Scorers */}
          {matchPlayers.length > 0 && (h > 0 || a > 0) && (
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Assign Goals to Players (Optional)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Credited: {scorerAssignments.reduce((s, i) => s + i.count, 0)} / {h + a} goals
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {matchPlayers.map(p => {
                  const assignment = scorerAssignments.find(i => i.playerId === p.id);
                  const count = assignment ? assignment.count : 0;
                  return (
                    <div 
                      key={p.id}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        count > 0 ? 'bg-amber-100 border-amber-300 text-amber-950' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleAddGoalToPlayer(p.id)}
                        className="hover:underline flex items-center space-x-1"
                      >
                        <span>{p.name}</span>
                        <span className="text-[10px] text-slate-400">({p.role})</span>
                      </button>
                      {count > 0 && (
                        <div className="flex items-center space-x-0.5 ml-1 font-bold">
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 text-[10px]">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveGoalFromPlayer(p.id)}
                            className="text-slate-400 hover:text-rose-600 px-0.5"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedMatchId}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isLoading ? 'Processing Trigger Logic...' : 'Complete Match & Recalculate Standings'}</span>
          </button>
        </form>
      )}

    </div>
  );
}
