import React, { useState } from 'react';
import { Trophy, Search, ArrowRight, Crown, Sparkles } from 'lucide-react';

export default function StandingsTable({ teams = [], matches = [], onSelectTeam }) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = (a.goals_for || 0) - (a.goals_against || 0);
    const gdB = (b.goals_for || 0) - (b.goals_against || 0);
    if (gdB !== gdA) return gdB - gdA;
    return (b.goals_for || 0) - (a.goals_for || 0);
  });

  const getTeamForm = (teamId) => {
    const teamCompletedMatches = matches
      .filter(m => m.status === 'Completed' && (m.home_team_id === teamId || m.away_team_id === teamId))
      .sort((a, b) => new Date(b.match_time || 0) - new Date(a.match_time || 0))
      .slice(0, 5);

    return teamCompletedMatches.map(m => {
      const isHome = m.home_team_id === teamId;
      const teamScore = isHome ? m.home_score : m.away_score;
      const oppScore = isHome ? m.away_score : m.home_score;
      if (teamScore > oppScore) return { result: 'W', class: 'bg-emerald-500 text-white' };
      if (teamScore === oppScore) return { result: 'D', class: 'bg-amber-500 text-white' };
      return { result: 'L', class: 'bg-red-500 text-white' };
    });
  };

  const filteredTeams = sortedTeams.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-red-950 shadow-md shadow-amber-500/20">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
                <span>League Points Table</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase tracking-wider border border-red-200">
                  Live Standings
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any squad row to view full schedule, past results & player roster.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search squad..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-red-100/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-200 border-b border-amber-500/30 text-[11px] sm:text-xs font-black uppercase tracking-wider">
                <th className="py-4 pl-4 sm:pl-6 pr-2 w-14 sm:w-16 text-center">Pos</th>
                <th className="py-4 px-3 sm:px-4">Squad</th>
                <th className="py-4 px-2.5 text-center" title="Matches Played">P</th>
                <th className="py-4 px-2.5 text-center" title="Wins">W</th>
                <th className="py-4 px-2.5 text-center" title="Draws">D</th>
                <th className="py-4 px-2.5 text-center" title="Losses">L</th>
                <th className="py-4 px-2.5 text-center hidden md:table-cell" title="Goals For">GF</th>
                <th className="py-4 px-2.5 text-center hidden md:table-cell" title="Goals Against">GA</th>
                <th className="py-4 px-2.5 text-center font-extrabold text-amber-300" title="Goal Difference">GD</th>
                <th className="py-4 px-2.5 text-center hidden lg:table-cell" title="Recent Form (Last 5)">Form</th>
                <th className="py-4 pr-4 sm:pr-6 pl-2.5 text-center font-black text-amber-400">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400 text-sm">
                    No matching squads found.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team, index) => {
                  const rank = index + 1;
                  const gd = (team.goals_for || 0) - (team.goals_against || 0);
                  const form = getTeamForm(team.id);

                  return (
                    <tr
                      key={team.id}
                      onClick={() => onSelectTeam && onSelectTeam(team)}
                      className={`hover:bg-amber-50/70 transition-all cursor-pointer group animate-fade-in-up ${
                        rank === 1
                          ? 'border-l-4 border-amber-400 bg-amber-50/30'
                          : rank <= 3
                          ? 'border-l-4 border-red-600'
                          : 'border-l-4 border-transparent'
                      }`}
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      {/* Position / Rank */}
                      <td className="py-4 pl-4 sm:pl-6 pr-2 text-center">
                        {rank === 1 && (
                          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-red-950 font-black flex items-center justify-center text-xs mx-auto shadow-md ring-2 ring-amber-300">
                            1
                          </span>
                        )}
                        {rank === 2 && (
                          <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center text-xs mx-auto shadow-sm">
                            2
                          </span>
                        )}
                        {rank === 3 && (
                          <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-black flex items-center justify-center text-xs mx-auto border border-amber-600/30">
                            3
                          </span>
                        )}
                        {rank > 3 && (
                          <span className="text-slate-400 font-bold text-xs block text-center">
                            {rank}
                          </span>
                        )}
                      </td>

                      {/* Team Name & Logo */}
                      <td className="py-4 px-3 sm:px-4">
                        <div className="flex items-center space-x-3">
                          {team.logo ? (
                            <img
                              src={team.logo}
                              alt={team.name}
                              className="w-9 h-9 rounded-xl object-cover border-2 border-amber-300 flex-shrink-0 shadow-sm bg-white"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: team.color || '#dc2626' }}
                            >
                              {team.badge || team.name?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 group-hover:text-red-700 transition-colors flex items-center space-x-1.5">
                              <span className="truncate max-w-[130px] sm:max-w-xs">{team.name}</span>
                              {rank === 1 && (
                                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-sm">
                                  👑 Leader
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block sm:hidden">
                              GF: {team.goals_for} · GA: {team.goals_against}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Played, Won, Drawn, Lost */}
                      <td className="py-4 px-2.5 text-center text-slate-600 font-bold">{team.matches_played || 0}</td>
                      <td className="py-4 px-2.5 text-center text-slate-800 font-bold">{team.wins || 0}</td>
                      <td className="py-4 px-2.5 text-center text-slate-500 font-medium">{team.draws || 0}</td>
                      <td className="py-4 px-2.5 text-center text-slate-500 font-medium">{team.losses || 0}</td>
                      <td className="py-4 px-2.5 text-center text-slate-600 hidden md:table-cell font-medium">{team.goals_for || 0}</td>
                      <td className="py-4 px-2.5 text-center text-slate-600 hidden md:table-cell font-medium">{team.goals_against || 0}</td>
                      
                      {/* Goal Difference */}
                      <td className="py-4 px-2.5 text-center">
                        <span className={`font-black ${gd > 0 ? 'text-amber-700' : gd < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {gd > 0 ? `+${gd}` : gd}
                        </span>
                      </td>

                      {/* Form (Last 5) */}
                      <td className="py-4 px-2.5 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center space-x-1">
                          {form.length === 0 ? (
                            <span className="text-slate-300 text-xs font-bold">-</span>
                          ) : (
                            form.map((f, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs ${f.class}`}
                                title={f.result === 'W' ? 'Win' : f.result === 'D' ? 'Draw' : 'Loss'}
                              >
                                {f.result}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-4 pr-3 sm:pr-6 pl-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className="inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-200 text-red-950 font-black text-sm border border-amber-300 shadow-sm">
                            {team.points || 0}
                          </span>
                          <span className="hidden sm:inline-flex items-center text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend / Table Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-300" />
              <span>1st: Champion Crown</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Top 3: Podium</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
            <span>Win = 3 pts</span>
            <span>•</span>
            <span>Draw = 1 pt</span>
            <span>•</span>
            <span>Loss = 0 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
