import React, { useState } from 'react';
import { 
  CalendarPlus, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeftRight, 
  Sparkles, 
  X, 
  Check, 
  Zap, 
  Search,
  Trophy,
  Filter
} from 'lucide-react';
import { scheduleMatch, updateMatch, deleteMatch, bulkScheduleMatches, completeMatchResult } from '../../lib/supabase';
import { formatRelativeMatchTime } from '../../lib/utils';

export default function ManageMatches({ teams = [], matches = [], players = [], onMatchesChanged }) {
  // Mode: 'single' (Add One) or 'generator' (Auto Round-Robin)
  const [entryMode, setEntryMode] = useState('single');

  // Single Match Form State
  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || '');
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || '');
  
  // Default kickoff tomorrow 7:00 AM
  const getTomorrowMorning = (hours = 7, minutes = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [matchTime, setMatchTime] = useState(getTomorrowMorning(7, 0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Filter / Search for bottom scheduled matches
  const [filter, setFilter] = useState('scheduled'); // 'scheduled', 'completed', 'all'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [editingMatch, setEditingMatch] = useState(null);
  const [deletingMatch, setDeletingMatch] = useState(null);
  const [scoringMatch, setScoringMatch] = useState(null);

  // Edit Form State
  const [editHomeTeamId, setEditHomeTeamId] = useState('');
  const [editAwayTeamId, setEditAwayTeamId] = useState('');
  const [editMatchTime, setEditMatchTime] = useState('');
  const [editStatus, setEditStatus] = useState('Scheduled');
  const [editHomeScore, setEditHomeScore] = useState('');
  const [editAwayScore, setEditAwayScore] = useState('');

  // Score Entry Modal State
  const [scoreHome, setScoreHome] = useState(0);
  const [scoreAway, setScoreAway] = useState(0);
  const [modalMatchEvents, setModalMatchEvents] = useState([]);
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [eventType, setEventType] = useState('goal'); // 'goal', 'yellow_card', 'red_card'
  const [eventMinute, setEventMinute] = useState('');

  // Inline event editing state
  const [editingEventIdx, setEditingEventIdx] = useState(null);
  const [editEvPlayerId, setEditEvPlayerId] = useState('');
  const [editEvMinute, setEditEvMinute] = useState('');

  // Sync teams selection if empty
  React.useEffect(() => {
    if (teams.length >= 2) {
      if (!homeTeamId) setHomeTeamId(teams[0].id);
      if (!awayTeamId) setAwayTeamId(teams[1].id);
    }
  }, [teams, homeTeamId, awayTeamId]);

  // Quick preset kicker
  const setPresetTime = (daysAhead, hours, minutes) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hours, minutes, 0, 0);
    setMatchTime(d.toISOString().slice(0, 16));
  };

  // Swap home and away
  const handleSwapTeams = () => {
    const temp = homeTeamId;
    setHomeTeamId(awayTeamId);
    setAwayTeamId(temp);
  };

  // Handle Single Match Scheduling
  const handleScheduleSingle = async (e) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) {
      setError('Please select both Home and Away squads.');
      return;
    }
    if (homeTeamId === awayTeamId) {
      setError('A team cannot play against itself. Please choose two different teams.');
      return;
    }
    if (!matchTime) {
      setError('Please specify the match date and kickoff time.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await scheduleMatch({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_time: matchTime,
      });

      const homeName = teams.find(t => t.id === homeTeamId)?.name || 'Home';
      const awayName = teams.find(t => t.id === awayTeamId)?.name || 'Away';
      setSuccess(`Scheduled: ${homeName} vs ${awayName}!`);

      if (onMatchesChanged) onMatchesChanged();
    } catch (err) {
      console.error('Error scheduling match:', err);
      setError(err.message || 'Failed to schedule match.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto Generate Full Round-Robin Fixtures
  const handleGenerateRoundRobin = async () => {
    if (teams.length < 2) {
      setError('At least 2 teams are required to generate round-robin fixtures.');
      return;
    }

    const confirmGen = window.confirm(
      `Generate full round-robin fixtures for all ${teams.length} teams? Each pair of squads will be scheduled with kickoff slots.`
    );
    if (!confirmGen) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const fixtures = [];
      let baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 1); // Start tomorrow
      baseDate.setHours(6, 30, 0, 0);

      let slotOffset = 0;
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const matchDate = new Date(baseDate);
          // Add 45 minutes between morning games, advance day every 3 matches
          const dayAdd = Math.floor(slotOffset / 3);
          const timeSlot = (slotOffset % 3) * 45; // 6:30, 7:15, 8:00 AM
          matchDate.setDate(matchDate.getDate() + dayAdd);
          matchDate.setMinutes(matchDate.getMinutes() + timeSlot);

          fixtures.push({
            home_team_id: teams[i].id,
            away_team_id: teams[j].id,
            match_time: matchDate.toISOString(),
          });
          slotOffset++;
        }
      }

      await bulkScheduleMatches(fixtures);
      setSuccess(`Successfully generated and scheduled ${fixtures.length} round-robin fixtures!`);
      if (onMatchesChanged) onMatchesChanged();
    } catch (err) {
      console.error('Error generating round-robin:', err);
      setError(err.message || 'Failed to auto-generate fixtures.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (match) => {
    setEditingMatch(match);
    setEditHomeTeamId(match.home_team_id);
    setEditAwayTeamId(match.away_team_id);
    setEditMatchTime(match.match_time ? new Date(match.match_time).toISOString().slice(0, 16) : '');
    setEditStatus(match.status || 'Scheduled');
    setEditHomeScore(match.home_score !== null && match.home_score !== undefined ? match.home_score : '');
    setEditAwayScore(match.away_score !== null && match.away_score !== undefined ? match.away_score : '');
    setError(null);
  };

  // Submit Edit Match
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMatch) return;
    if (editHomeTeamId === editAwayTeamId) {
      setError('A team cannot play against itself.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateMatch(editingMatch.id, {
        home_team_id: editHomeTeamId,
        away_team_id: editAwayTeamId,
        match_time: editMatchTime,
        status: editStatus,
        home_score: editHomeScore !== '' ? parseInt(editHomeScore, 10) : null,
        away_score: editAwayScore !== '' ? parseInt(editAwayScore, 10) : null,
      });

      setSuccess('Match updated successfully!');
      setEditingMatch(null);
      if (onMatchesChanged) onMatchesChanged();
    } catch (err) {
      console.error('Error updating match:', err);
      setError(err.message || 'Failed to update match.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Score Entry Modal
  const openScoreModal = (match) => {
    setScoringMatch(match);
    setScoreHome(match.home_score !== null && match.home_score !== undefined ? match.home_score : 0);
    setScoreAway(match.away_score !== null && match.away_score !== undefined ? match.away_score : 0);
    setModalMatchEvents(match.events ? [...match.events] : []);
    setEventPlayerId('');
    setEventType('goal');
    setEventMinute('');
    setEditingEventIdx(null);
    setEditEvPlayerId('');
    setEditEvMinute('');
    setError(null);
  };

  const handleAddEvent = () => {
    if (!eventPlayerId) return;
    const p = players.find(x => x.id === eventPlayerId);
    if (!p) return;

    const newEv = {
      id: `ev-${Date.now()}`,
      type: eventType,
      playerId: p.id,
      playerName: p.name,
      teamId: p.team_id,
      minute: eventMinute ? parseInt(eventMinute, 10) : null,
    };

    setModalMatchEvents([...modalMatchEvents, newEv]);
    setEventMinute('');
  };

  const handleRemoveEvent = (idx) => {
    const updated = [...modalMatchEvents];
    updated.splice(idx, 1);
    setModalMatchEvents(updated);
  };

  // Start inline editing an event row
  const handleStartEditEvent = (idx) => {
    const ev = modalMatchEvents[idx];
    setEditingEventIdx(idx);
    setEditEvPlayerId(ev.playerId || '');
    setEditEvMinute(ev.minute !== null && ev.minute !== undefined ? String(ev.minute) : '');
  };

  // Save the inline edit
  const handleSaveEditEvent = (idx) => {
    if (!editEvPlayerId) return;
    const p = players.find(x => x.id === editEvPlayerId);
    if (!p) return;
    const updated = [...modalMatchEvents];
    updated[idx] = {
      ...updated[idx],
      playerId: p.id,
      playerName: p.name,
      teamId: p.team_id,
      minute: editEvMinute ? parseInt(editEvMinute, 10) : null,
    };
    setModalMatchEvents(updated);
    setEditingEventIdx(null);
    setEditEvPlayerId('');
    setEditEvMinute('');
  };

  // Cancel inline edit
  const handleCancelEditEvent = () => {
    setEditingEventIdx(null);
    setEditEvPlayerId('');
    setEditEvMinute('');
  };

  // Submit Score Entry (Complete Match with trigger logic and disciplinary cards)
  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!scoringMatch) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const playerScorers = [];
      modalMatchEvents.filter(ev => ev.type === 'goal').forEach(g => {
        const existing = playerScorers.find(x => x.playerId === g.playerId);
        if (existing) existing.count += 1;
        else playerScorers.push({ playerId: g.playerId, count: 1 });
      });

      await completeMatchResult({
        matchId: scoringMatch.id,
        homeScore: scoreHome,
        awayScore: scoreAway,
        events: modalMatchEvents,
        playerScorers,
      });

      setSuccess('Match score & disciplinary cards recorded! Standings & suspensions updated.');
      setScoringMatch(null);
      if (onMatchesChanged) onMatchesChanged();
    } catch (err) {
      console.error('Error completing match score:', err);
      setError(err.message || 'Failed to enter match score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Match
  const handleDeleteMatch = async () => {
    if (!deletingMatch) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteMatch(deletingMatch.id);
      setSuccess('Match deleted successfully.');
      setDeletingMatch(null);
      if (onMatchesChanged) onMatchesChanged();
    } catch (err) {
      console.error('Error deleting match:', err);
      setError(err.message || 'Failed to delete match.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered and searched matches for the bottom list
  const filteredMatches = matches.filter((m) => {
    if (filter === 'scheduled' && m.status !== 'Scheduled') return false;
    if (filter === 'completed' && m.status !== 'Completed') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const hName = teams.find(t => t.id === m.home_team_id)?.name || m.home_team?.name || '';
      const aName = teams.find(t => t.id === m.away_team_id)?.name || m.away_team?.name || '';
      return hName.toLowerCase().includes(term) || aName.toLowerCase().includes(term);
    }
    return true;
  });

  const scheduledCount = matches.filter(m => m.status === 'Scheduled').length;
  const completedCount = matches.filter(m => m.status === 'Completed').length;

  return (
    <div className="space-y-8">
      
      {/* ============================================================== */}
      {/* 1. TOP SECTION: EASY MATCH CREATION & BULK SCHEDULER */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-red-100 shadow-xl relative overflow-hidden">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md">
              <CalendarPlus className="w-5 h-5 stroke-[2.4] text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
                <span>Fast Match Scheduler</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase border border-amber-300">
                  Easy Entry
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Add single fixtures or auto-generate full tournament matchdays in 1-click.
              </p>
            </div>
          </div>

          {/* Quick Mode Toggle */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleGenerateRoundRobin}
              disabled={isSubmitting || teams.length < 2}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center space-x-1.5 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-red-950" />
              <span>Auto-Generate All ({teams.length * (teams.length - 1) / 2} Matches)</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in-up">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-amber-700 hover:text-amber-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Single Match Quick Add Form */}
        <form onSubmit={handleScheduleSingle} className="mt-5 space-y-4">
          
          {/* Squad Selectors & Swap Button */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            
            {/* Home Team */}
            <div className="md:col-span-5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Home Squad <span className="text-red-600">*</span></span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Host</span>
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                required
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white shadow-inner"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === awayTeamId}>
                    {t.badge || '⚽'} {t.name} {t.id === awayTeamId ? '(Selected as Away)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center py-1">
              <button
                type="button"
                onClick={handleSwapTeams}
                title="Swap Home and Away"
                className="p-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-sm transition-transform active:scale-90"
              >
                <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Away Team */}
            <div className="md:col-span-5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Away Squad <span className="text-red-600">*</span></span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Visitor</span>
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                required
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white shadow-inner"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === homeTeamId}>
                    {t.badge || '⚽'} {t.name} {t.id === homeTeamId ? '(Selected as Home)' : ''}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Kickoff Datetime Picker & Quick Presets */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Kickoff Date & Time <span className="text-red-600">*</span></span>
              </label>

              {/* Fast 1-Tap Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">Quick:</span>
                <button
                  type="button"
                  onClick={() => setPresetTime(1, 6, 30)}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                >
                  Tomorrow 6:30 AM
                </button>
                <button
                  type="button"
                  onClick={() => setPresetTime(1, 7, 0)}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                >
                  Tomorrow 7:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => setPresetTime(1, 7, 30)}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                >
                  Tomorrow 7:30 AM
                </button>
                <button
                  type="button"
                  onClick={() => setPresetTime(2, 7, 0)}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                >
                  +2 Days 7 AM
                </button>
              </div>
            </div>

            <input
              type="datetime-local"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || teams.length < 2}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-yellow-500 text-white font-black text-sm shadow-lg shadow-amber-600/25 flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>{isSubmitting ? 'Adding Match...' : 'Schedule Match'}</span>
            </button>
          </div>

        </form>

      </div>

      {/* ============================================================== */}
      {/* 2. BOTTOM SECTION: "SEE SCHEDULED MATCHES DOWN WHILE ENTERING" */}
      {/* ============================================================== */}
      <div className="space-y-4">
        
        {/* Section Header with Live Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
              <span>Existing Match Fixtures</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 text-xs font-black border border-red-300">
                {matches.length} Total
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review existing matches down below while adding. Edit kickoff, enter scores, or delete fixtures.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'scheduled'
                    ? 'bg-amber-400 text-red-950 font-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming ({scheduledCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'completed'
                    ? 'bg-amber-400 text-red-950 font-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Finished ({completedCount})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-amber-400 text-red-950 font-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({matches.length})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find squad..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Matches Grid List */}
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-extrabold text-slate-700 text-sm">No matches in this category</h4>
            <p className="text-xs text-slate-400 mt-1">
              Use the form above to schedule your first fixture.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMatches.map((match) => {
              const isCompleted = match.status === 'Completed';
              const homeTeam = teams.find(t => t.id === match.home_team_id) || match.home_team || { name: 'Home' };
              const awayTeam = teams.find(t => t.id === match.away_team_id) || match.away_team || { name: 'Away' };

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl p-4 border border-red-100 shadow-md hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  {/* Top Bar: Kickoff & Status */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-500 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{formatRelativeMatchTime(match.match_time)}</span>
                    </span>

                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 text-[10px] font-black uppercase">
                        Full Time ({match.home_score}–{match.away_score})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                        Scheduled
                      </span>
                    )}
                  </div>

                  {/* Teams Matchup Center */}
                  <div className="py-3 flex items-center justify-between gap-2">
                    {/* Home */}
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      {homeTeam.logo ? (
                        <img
                          src={homeTeam.logo}
                          alt={homeTeam.name}
                          className="w-9 h-9 rounded-xl object-cover border border-amber-300 shadow-2xs flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-2xs flex-shrink-0"
                          style={{ backgroundColor: homeTeam.color || '#dc2626' }}
                        >
                          {homeTeam.badge || '⚽'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-800 text-sm truncate">{homeTeam.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Home</div>
                      </div>
                    </div>

                    {/* Center Score / VS */}
                    <div className="px-2 text-center flex-shrink-0">
                      {isCompleted ? (
                        <div className="px-3 py-1 bg-gradient-to-r from-red-950 to-amber-950 text-amber-300 rounded-xl font-black text-sm tracking-wider border border-amber-500/40 shadow-sm">
                          {match.home_score} : {match.away_score}
                        </div>
                      ) : (
                        <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 text-xs font-black flex items-center justify-center border border-slate-200">
                          VS
                        </span>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex items-center justify-end space-x-2.5 flex-1 min-w-0 text-right">
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-800 text-sm truncate">{awayTeam.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Away</div>
                      </div>
                      {awayTeam.logo ? (
                        <img
                          src={awayTeam.logo}
                          alt={awayTeam.name}
                          className="w-9 h-9 rounded-xl object-cover border border-amber-300 shadow-2xs flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-2xs flex-shrink-0"
                          style={{ backgroundColor: awayTeam.color || '#dc2626' }}
                        >
                          {awayTeam.badge || '⚽'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Buttons (Edit, Score, Delete) */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Turf 1 Kickoff
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Enter / Edit Score */}
                      <button
                        type="button"
                        onClick={() => openScoreModal(match)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors flex items-center space-x-1"
                        title="Enter / Update Result Score"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isCompleted ? 'Edit Score' : 'Enter Score'}</span>
                      </button>

                      {/* Edit Match Time / Teams */}
                      <button
                        type="button"
                        onClick={() => openEditModal(match)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                        title="Edit Fixture Datetime or Teams"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Match */}
                      <button
                        type="button"
                        onClick={() => setDeletingMatch(match)}
                        className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 transition-colors"
                        title="Delete Match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* 3. MODALS: EDIT MATCH & SCORE ENTRY & DELETE CONFIRMATION */}
      {/* ============================================================== */}

      {/* Edit Match Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-lg font-black text-slate-900 font-display flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>Edit Match Fixture</span>
              </h4>
              <button
                onClick={() => setEditingMatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Home Squad
                </label>
                <select
                  value={editHomeTeamId}
                  onChange={(e) => setEditHomeTeamId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Away Squad
                </label>
                <select
                  value={editAwayTeamId}
                  onChange={(e) => setEditAwayTeamId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kickoff Datetime
                </label>
                <input
                  type="datetime-local"
                  value={editMatchTime}
                  onChange={(e) => setEditMatchTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {editStatus === 'Completed' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Home Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editHomeScore}
                      onChange={(e) => setEditHomeScore(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Away Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editAwayScore}
                      onChange={(e) => setEditAwayScore(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-center"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter / Complete Score Modal with Goals & Disciplinary Cards */}
      {scoringMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-amber-300">
            <div className="text-center pb-3 border-b border-slate-100">
              <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-2 font-black text-xl">
                🏆
              </span>
              <h4 className="text-xl font-black text-slate-900 font-display">
                Record Matchday Result
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Enter score, attribute goalscorers, and log yellow/red cards.
              </p>
            </div>

            <form onSubmit={handleSaveScore} className="mt-5 space-y-5">
              
              {/* Score Input Box */}
              <div className="grid grid-cols-5 items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="col-span-2 text-center">
                  <div className="font-black text-slate-900 text-sm sm:text-base mb-1 truncate leading-tight">
                    {teams.find(t => t.id === scoringMatch.home_team_id)?.name || 'Home'}
                  </div>
                  <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2">🏠 Home</div>
                  <input
                    type="number"
                    min="0"
                    value={scoreHome}
                    onChange={(e) => setScoreHome(parseInt(e.target.value, 10) || 0)}
                    className="w-20 mx-auto px-2 py-2.5 border-2 border-amber-300 focus:border-amber-500 rounded-xl text-3xl font-black text-center text-slate-900 bg-white shadow-inner block"
                  />
                </div>

                <div className="col-span-1 text-center font-black text-slate-400 text-2xl mt-6">
                  :
                </div>

                <div className="col-span-2 text-center">
                  <div className="font-black text-slate-900 text-sm sm:text-base mb-1 truncate leading-tight">
                    {teams.find(t => t.id === scoringMatch.away_team_id)?.name || 'Away'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">✈️ Away</div>
                  <input
                    type="number"
                    min="0"
                    value={scoreAway}
                    onChange={(e) => setScoreAway(parseInt(e.target.value, 10) || 0)}
                    className="w-20 mx-auto px-2 py-2.5 border-2 border-amber-300 focus:border-amber-500 rounded-xl text-3xl font-black text-center text-slate-900 bg-white shadow-inner block"
                  />
                </div>
              </div>

              {/* Event Summary Badges */}
              {modalMatchEvents.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {modalMatchEvents.filter(e => e.type === 'goal').length > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm font-bold text-green-800">
                      ⚽ {modalMatchEvents.filter(e => e.type === 'goal').length} Goal{modalMatchEvents.filter(e => e.type === 'goal').length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {modalMatchEvents.filter(e => e.type === 'yellow_card').length > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-bold text-yellow-800">
                      🟨 {modalMatchEvents.filter(e => e.type === 'yellow_card').length} Yellow{modalMatchEvents.filter(e => e.type === 'yellow_card').length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {modalMatchEvents.filter(e => e.type === 'red_card').length > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-sm font-bold text-red-800">
                      🟥 {modalMatchEvents.filter(e => e.type === 'red_card').length} Red{modalMatchEvents.filter(e => e.type === 'red_card').length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Match Events: Add Goal Scorer or Card */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                <div className="text-sm font-black uppercase tracking-wider text-amber-900 mb-3 flex items-center justify-between">
                  <span>Log Goals &amp; Cards</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Auto-Suspension ON</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  {/* Event Type */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                    >
                      <option value="goal">⚽ Goal</option>
                      <option value="yellow_card">🟨 Yellow</option>
                      <option value="red_card">🟥 Red</option>
                    </select>
                  </div>

                  {/* Player Selector */}
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Player</label>
                    <select
                      value={eventPlayerId}
                      onChange={(e) => setEventPlayerId(e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                    >
                      <option value="">-- Select Player --</option>
                      <optgroup label={`🏠 ${teams.find(t => t.id === scoringMatch.home_team_id)?.name || 'Home Squad'}`}>
                        {players.filter(p => p.team_id === scoringMatch.home_team_id).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}{p.is_suspended ? ' ⛔ Banned' : ''}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={`✈️ ${teams.find(t => t.id === scoringMatch.away_team_id)?.name || 'Away Squad'}`}>
                        {players.filter(p => p.team_id === scoringMatch.away_team_id).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}{p.is_suspended ? ' ⛔ Banned' : ''}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Minute + Add Button */}
                  <div className="sm:col-span-4 flex gap-2">
                    <div className="w-20 flex-shrink-0">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min</label>
                      <input
                        type="number"
                        placeholder="45"
                        min="1"
                        value={eventMinute}
                        onChange={(e) => setEventMinute(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-base font-black text-center focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col justify-end flex-1">
                      <button
                        type="button"
                        onClick={handleAddEvent}
                        disabled={!eventPlayerId}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black transition-colors disabled:opacity-40"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events Table */}
                {modalMatchEvents.length > 0 ? (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 font-black uppercase text-[10px]">
                          <td className="px-3 py-2 w-8"></td>
                          <td className="px-3 py-2">Player</td>
                          <td className="px-3 py-2 text-center w-16">Min</td>
                          <td className="px-3 py-2 text-center">Team</td>
                          <td className="px-2 py-2 w-16 text-center">Actions</td>
                        </tr>
                      </thead>
                      <tbody>
                        {modalMatchEvents.map((ev, idx) => {
                          const evTeam = teams.find(t => t.id === ev.teamId);
                          const isHome = ev.teamId === scoringMatch.home_team_id;
                          const isEditing = editingEventIdx === idx;

                          if (isEditing) {
                            // ── EDIT ROW ──
                            return (
                              <tr key={idx} className="border-t border-amber-200 bg-amber-50">
                                <td className="px-3 py-2 text-base">
                                  {ev.type === 'goal' && '⚽'}
                                  {ev.type === 'yellow_card' && '🟨'}
                                  {ev.type === 'red_card' && '🟥'}
                                </td>
                                <td className="px-2 py-1.5" colSpan={1}>
                                  <select
                                    value={editEvPlayerId}
                                    onChange={e => setEditEvPlayerId(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border-2 border-amber-400 rounded-lg text-xs font-bold focus:outline-none"
                                  >
                                    <option value="">-- Select Player --</option>
                                    <optgroup label={`🏠 ${teams.find(t => t.id === scoringMatch.home_team_id)?.name || 'Home'}`}>
                                      {players.filter(p => p.team_id === scoringMatch.home_team_id).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label={`✈️ ${teams.find(t => t.id === scoringMatch.away_team_id)?.name || 'Away'}`}>
                                      {players.filter(p => p.team_id === scoringMatch.away_team_id).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </optgroup>
                                  </select>
                                </td>
                                <td className="px-2 py-1.5">
                                  <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    placeholder="Min"
                                    value={editEvMinute}
                                    onChange={e => setEditEvMinute(e.target.value)}
                                    className="w-14 px-2 py-1.5 bg-white border-2 border-amber-400 rounded-lg text-xs font-black text-center focus:outline-none"
                                  />
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isHome ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                                    {isHome ? '🏠' : '✈️'} {evTeam?.name || '—'}
                                  </span>
                                </td>
                                <td className="px-2 py-1.5">
                                  <div className="flex items-center gap-1 justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditEvent(idx)}
                                      disabled={!editEvPlayerId}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black disabled:opacity-40"
                                    >
                                      ✓ Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEditEvent}
                                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-black"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          // ── NORMAL ROW ──
                          return (
                            <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50">
                              <td className="px-3 py-2 text-base">
                                {ev.type === 'goal' && '⚽'}
                                {ev.type === 'yellow_card' && '🟨'}
                                {ev.type === 'red_card' && '🟥'}
                              </td>
                              <td className="px-3 py-2 font-bold text-slate-800">{ev.playerName}</td>
                              <td className="px-3 py-2 text-center text-slate-500 font-mono">{ev.minute ? `${ev.minute}'` : '—'}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isHome ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                                  {isHome ? '🏠' : '✈️'} {evTeam?.name || '—'}
                                </span>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex items-center gap-1.5 justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditEvent(idx)}
                                    className="text-slate-400 hover:text-amber-600 transition-colors"
                                    title="Edit this entry"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEvent(idx)}
                                    className="text-slate-300 hover:text-red-600 font-black text-lg leading-none"
                                    title="Delete this entry"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-slate-400 italic text-center py-3">
                    No events logged yet. Select a player and click Add.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setScoringMatch(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 text-white font-black text-sm shadow-md"
                >
                  {isSubmitting ? 'Recording...' : 'Complete & Update Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Match Confirmation */}
      {deletingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900 font-display">
              Delete This Fixture?
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to remove this match from the tournament schedule?
            </p>

            <div className="mt-5 flex items-center justify-center space-x-2">
              <button
                onClick={() => setDeletingMatch(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMatch}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
