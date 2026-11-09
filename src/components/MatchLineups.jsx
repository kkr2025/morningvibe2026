import React, { useState } from 'react';
import { 
  ClipboardList, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  UserX, 
  Users, 
  Trophy, 
  Flame, 
  Shield, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { formatRelativeMatchTime } from '../lib/utils';

export default function MatchLineups({ matches = [], teams = [], players = [] }) {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || null);

  const selectedMatch = matches.find(m => m.id === selectedMatchId) || matches[0];

  const homeTeam = selectedMatch ? (teams.find(t => t.id === selectedMatch.home_team_id) || selectedMatch.home_team || { name: 'Home' }) : null;
  const awayTeam = selectedMatch ? (teams.find(t => t.id === selectedMatch.away_team_id) || selectedMatch.away_team || { name: 'Away' }) : null;

  const homePlayers = selectedMatch ? players.filter(p => p.team_id === selectedMatch.home_team_id) : [];
  const awayPlayers = selectedMatch ? players.filter(p => p.team_id === selectedMatch.away_team_id) : [];

  const homeSuspended = homePlayers.filter(p => p.is_suspended);
  const awaySuspended = awayPlayers.filter(p => p.is_suspended);

  const lineups = selectedMatch?.lineups || { home_starting: [], away_starting: [] };
  const events = selectedMatch?.events || [];

  // Position grouping config
  const POSITION_ORDER = ['Goalkeeper', 'Center Back', 'Midfielder', 'Forward'];
  const POSITION_LABELS = {
    'Goalkeeper': '🧤 Goalkeeper',
    'Center Back': '🛡️ Defenders',
    'Midfielder': '⚡ Midfielders',
    'Forward': '⚽ Forwards',
  };

  const groupByPosition = (playerList) => {
    const grouped = {};
    POSITION_ORDER.forEach(role => {
      const inRole = playerList.filter(p => p.role === role || (role === 'Forward' && !POSITION_ORDER.includes(p.role)));
      if (inRole.length > 0) grouped[role] = inRole;
    });
    return grouped;
  };

  const homeGrouped = groupByPosition(homePlayers);
  const awayGrouped = groupByPosition(awayPlayers);

  const renderPlayerRow = (player, lineupStarting) => {
    const isStarting = lineupStarting?.includes(player.id);
    return (
      <div
        key={player.id}
        className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
          player.is_suspended
            ? 'bg-red-50/50 border-red-200 opacity-70'
            : isStarting
            ? 'bg-amber-50/60 border-amber-300 font-bold'
            : 'bg-white border-slate-100 hover:border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <span className="font-bold text-slate-800 text-sm">{player.name}</span>
          {isStarting && (
            <span className="px-1.5 rounded bg-amber-400 text-red-950 text-[9px] font-black uppercase">
              XI
            </span>
          )}
        </div>

        {/* Cards & Status */}
        <div className="flex items-center space-x-2">
          {player.yellow_cards > 0 && (
            <span className="inline-flex items-center space-x-0.5 text-xs font-bold text-yellow-800 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-300">
              <span>🟨</span>
              <span>{player.yellow_cards}</span>
            </span>
          )}
          {player.red_cards > 0 && (
            <span className="inline-flex items-center space-x-0.5 text-xs font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded border border-red-300">
              <span>🟥</span>
              <span>{player.red_cards}</span>
            </span>
          )}
          {player.is_suspended && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase">
              Banned
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
              <ClipboardList className="w-5 h-5 text-amber-200 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
                <span>Matchday Lineups & Suspensions</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-black uppercase border border-red-300">
                  Official Teamsheet
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Starting rosters, active yellow/red card bans, and match event timelines.
              </p>
            </div>
          </div>
        </div>

        {/* Fixture Selector Dropdown */}
        <div className="w-full sm:w-80">
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
            Select Matchday Fixture:
          </label>
          <select
            value={selectedMatchId || ''}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          >
            {matches.map((m) => {
              const h = teams.find(t => t.id === m.home_team_id)?.name || m.home_team?.name || 'Home';
              const a = teams.find(t => t.id === m.away_team_id)?.name || m.away_team?.name || 'Away';
              return (
                <option key={m.id} value={m.id}>
                  {h} vs {a} ({m.status === 'Completed' ? `${m.home_score}–${m.away_score}` : 'Upcoming'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {!selectedMatch ? (
        <div className="bg-white rounded-3xl p-10 text-center text-slate-400 border border-slate-200">
          No matches found.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Match Scoreboard Header Card (KSL Style) */}
          <div className="bg-gradient-to-r from-[#2a0404] via-[#4d0707] to-[#1a0202] text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Home Squad */}
              <div className="flex items-center space-x-3.5 flex-1 justify-center sm:justify-start">
                {homeTeam?.logo ? (
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md bg-white" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-red-600 text-white text-2xl font-bold flex items-center justify-center shadow-md">
                    {homeTeam?.badge || '⚽'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg sm:text-xl font-black font-display">{homeTeam?.name}</h3>
                  <span className="text-[11px] font-bold text-amber-300 uppercase">Home Squad</span>
                </div>
              </div>

              {/* Center Status / Score */}
              <div className="text-center px-4">
                {selectedMatch.status === 'Completed' ? (
                  <div className="inline-flex items-center space-x-3 px-5 py-2 rounded-2xl bg-black/60 border border-amber-500/50 shadow-inner">
                    <span className="text-2xl sm:text-3xl font-black text-white">{selectedMatch.home_score}</span>
                    <span className="text-amber-400 font-bold text-lg">–</span>
                    <span className="text-2xl sm:text-3xl font-black text-white">{selectedMatch.away_score}</span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-amber-400 text-red-950 font-black text-sm uppercase tracking-wider shadow-md">
                    VS
                  </div>
                )}
                <div className="text-xs text-amber-200/80 font-medium mt-2 flex items-center justify-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatRelativeMatchTime(selectedMatch.match_time)}</span>
                </div>
              </div>

              {/* Away Squad */}
              <div className="flex items-center space-x-3.5 flex-1 justify-center sm:justify-end text-right">
                <div>
                  <h3 className="text-lg sm:text-xl font-black font-display">{awayTeam?.name}</h3>
                  <span className="text-[11px] font-bold text-amber-300 uppercase">Away Squad</span>
                </div>
                {awayTeam?.logo ? (
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md bg-white" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white text-2xl font-bold flex items-center justify-center shadow-md">
                    {awayTeam?.badge || '⚡'}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Match Events Bar (Goals, Yellow Cards, Red Cards) */}
          {events.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-md">
              <h4 className="text-xs font-black uppercase tracking-wider text-red-700 mb-3 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Recorded Match Events</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {events.map((ev, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      {ev.type === 'goal' && <span className="text-sm">⚽</span>}
                      {ev.type === 'yellow_card' && <span className="w-3.5 h-4.5 rounded bg-yellow-400 border border-yellow-500 inline-block shadow-xs" />}
                      {ev.type === 'red_card' && <span className="w-3.5 h-4.5 rounded bg-red-600 border border-red-700 inline-block shadow-xs" />}
                      <span className="font-extrabold text-slate-800">{ev.playerName || 'Player'}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      {ev.minute ? `${ev.minute}'` : 'Event'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-Side Lineup & Suspensions Roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* HOME SQUAD LINEUP */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-l-4 border-red-600 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-900 text-base">{homeTeam?.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Squad</span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {homePlayers.length} Registered
                </span>
              </div>

              {/* Suspended Players Banner if any */}
              {homeSuspended.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="text-[11px] font-black uppercase text-red-700 flex items-center space-x-1.5 mb-2">
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspended / Ineligible for this Match ({homeSuspended.length})</span>
                  </div>
                  <div className="space-y-1">
                    {homeSuspended.map((sp) => (
                      <div key={sp.id} className="text-xs text-red-900 flex items-center justify-between font-bold bg-white/60 px-2.5 py-1 rounded-lg">
                        <span>⛔ {sp.name}</span>
                        <span className="text-[10px] text-red-600 font-semibold">{sp.suspension_reason || 'Card Suspension'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Starting Players Roster - Grouped by Position */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 pb-1">
                  Squad Players &amp; Discipline
                </div>
                {Object.entries(homeGrouped).map(([role, rolePlayers]) => (
                  <div key={role}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-1 rounded-lg mb-1 mt-2 border border-red-100">
                      {POSITION_LABELS[role] || role}
                    </div>
                    <div className="space-y-1.5">
                      {rolePlayers.map(player => renderPlayerRow(player, lineups.home_starting))}
                    </div>
                  </div>
                ))}
                {homePlayers.length === 0 && (
                  <div className="text-xs text-slate-400 italic text-center py-4">No players registered.</div>
                )}
              </div>

            </div>

            {/* AWAY SQUAD LINEUP */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-l-4 border-slate-800 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-slate-900 text-base">{awayTeam?.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Squad</span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {awayPlayers.length} Registered
                </span>
              </div>

              {/* Suspended Players Banner if any */}
              {awaySuspended.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="text-[11px] font-black uppercase text-red-700 flex items-center space-x-1.5 mb-2">
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspended / Ineligible for this Match ({awaySuspended.length})</span>
                  </div>
                  <div className="space-y-1">
                    {awaySuspended.map((sp) => (
                      <div key={sp.id} className="text-xs text-red-900 flex items-center justify-between font-bold bg-white/60 px-2.5 py-1 rounded-lg">
                        <span>⛔ {sp.name}</span>
                        <span className="text-[10px] text-red-600 font-semibold">{sp.suspension_reason || 'Card Suspension'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Starting Players Roster - Grouped by Position */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-slate-400 pb-1">
                  Squad Players &amp; Discipline
                </div>
                {Object.entries(awayGrouped).map(([role, rolePlayers]) => (
                  <div key={role}>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-lg mb-1 mt-2 border border-slate-200">
                      {POSITION_LABELS[role] || role}
                    </div>
                    <div className="space-y-1.5">
                      {rolePlayers.map(player => renderPlayerRow(player, lineups.away_starting))}
                    </div>
                  </div>
                ))}
                {awayPlayers.length === 0 && (
                  <div className="text-xs text-slate-400 italic text-center py-4">No players registered.</div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
