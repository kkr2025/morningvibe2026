import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Edit3,
  CalendarDays,
  Shield,
  Trophy,
  Shirt
} from 'lucide-react';
import { formatMatchTime, formatRelativeMatchTime } from '../lib/utils';

export default function MatchCenter({ 
  matches = [], 
  teams = [], 
  isAdminLoggedIn, 
  onSelectMatchToUpdate,
  onViewLineup
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'scheduled', 'completed'

  const completedMatches = matches.filter(m => m.status === 'Completed');
  const scheduledMatches = matches.filter(m => m.status === 'Scheduled');

  const displayedMatches = matches.filter(m => {
    if (filter === 'scheduled') return m.status === 'Scheduled';
    if (filter === 'completed') return m.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Calendar className="w-5 h-5 stroke-[2.5] text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
                <span>Tournament Fixtures & Results</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300">
                  Round-Robin
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kickoff times, live score updates, and matchday results for the Morning Cup.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills in Red & Gold */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            All ({matches.length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'scheduled'
                ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            Upcoming ({scheduledMatches.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-red-700 to-amber-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            Results ({completedMatches.length})
          </button>
        </div>
      </div>

      {/* Matches Grid */}
      {displayedMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-red-100 shadow-sm">
          <CalendarDays className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No matches found</h3>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no {filter} matches scheduled in the tournament.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMatches.map((match) => {
            const isCompleted = match.status === 'Completed';
            const homeScore = match.home_score;
            const awayScore = match.away_score;
            const homeWon = isCompleted && homeScore > awayScore;
            const awayWon = isCompleted && awayScore > homeScore;
            const isDraw = isCompleted && homeScore === awayScore;

            const homeTeam = match.home_team || { name: 'Home Team' };
            const awayTeam = match.away_team || { name: 'Away Team' };

            // Find full team object to get logo or colors
            const homeFull = teams.find(t => t.id === match.home_team_id) || homeTeam;
            const awayFull = teams.find(t => t.id === match.away_team_id) || awayTeam;

            return (
              <div
                key={match.id}
                className="bg-white rounded-3xl p-5 shadow-md border border-slate-200/80 border-l-4 border-l-red-600 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Match Header: Time & Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 font-bold">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>{formatRelativeMatchTime(match.match_time)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                      Pandallur Turf
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-900 border border-red-300">
                        <CheckCircle2 className="w-3 h-3 text-red-700" />
                        <span>Full Time (FT)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Scheduled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Teams & Scoreboard */}
                <div className="grid grid-cols-7 items-center gap-2 my-2">
                  
                  {/* Home Team */}
                  <div className="col-span-3 text-right">
                    <div className="flex items-center justify-end space-x-2.5">
                      <div className="min-w-0">
                        <div className={`text-sm sm:text-base font-black truncate ${
                          homeWon ? 'text-red-700' : 'text-slate-800'
                        }`}>
                          {homeTeam.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Home</div>
                      </div>
                      
                      {homeFull.logo ? (
                        <img
                          src={homeFull.logo}
                          alt={homeTeam.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-amber-300 flex-shrink-0 shadow-sm bg-white"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: homeFull.color || '#dc2626' }}
                        >
                          {homeFull.badge || '⚽'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Score / VS Box */}
                  <div className="col-span-1 text-center flex flex-col items-center justify-center">
                    {isCompleted ? (
                      <div className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-950 to-amber-950 text-amber-300 font-black text-base sm:text-lg tracking-wider shadow-md border border-amber-500/40">
                        <span>{homeScore}</span>
                        <span className="mx-1 text-amber-400/60 font-normal">:</span>
                        <span>{awayScore}</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 text-red-950 font-black text-xs flex items-center justify-center border border-amber-300 shadow-sm">
                        VS
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="col-span-3 text-left">
                    <div className="flex items-center space-x-2.5">
                      {awayFull.logo ? (
                        <img
                          src={awayFull.logo}
                          alt={awayTeam.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-amber-300 flex-shrink-0 shadow-sm bg-white"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: awayFull.color || '#dc2626' }}
                        >
                          {awayFull.badge || '⚽'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className={`text-sm sm:text-base font-black truncate ${
                          awayWon ? 'text-red-700' : 'text-slate-800'
                        }`}>
                          {awayTeam.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold uppercase">Away</div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Match Events Summary (Goals & Disciplinary Cards) */}
                {match.events && match.events.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    {match.events.slice(0, 6).map((evt, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-semibold"
                      >
                        <span>{evt.type === 'goal' ? '⚽' : evt.type === 'red_card' ? '🟥' : '🟨'}</span>
                        <span className="font-extrabold">{evt.playerName || evt.player_name || '?'}</span>
                        {evt.minute && <span className="text-slate-400 text-[10px]">{evt.minute}'</span>}
                      </span>
                    ))}
                    {match.events.length > 6 && (
                      <span className="text-[10px] text-slate-400 font-bold px-1.5">
                        +{match.events.length - 6} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Details / Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="text-[11px] text-slate-400 font-medium">
                    🏆 Morning Turf, Pandallur
                  </div>

                  <div className="flex items-center space-x-2">
                    {onViewLineup && (
                      <button
                        onClick={() => onViewLineup(match)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 font-bold text-xs transition-colors border border-slate-200"
                      >
                        <Shirt className="w-3.5 h-3.5 text-amber-600" />
                        <span>Lineups</span>
                      </button>
                    )}

                    {isAdminLoggedIn && !isCompleted && onSelectMatchToUpdate && (
                      <button
                        onClick={() => onSelectMatchToUpdate(match)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-500 hover:to-amber-500 font-black text-xs shadow-sm transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Enter Score</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
