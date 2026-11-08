import React, { useState } from 'react';
import { 
  Award, 
  Flame, 
  Trophy, 
  Search, 
  User, 
  ShieldCheck, 
  Target,
  Sparkles
} from 'lucide-react';
import { getRoleBadgeClass } from '../lib/utils';

export default function TopScorers({ players = [], teams = [] }) {
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter players who scored at least 1 goal first, or all players
  const scorers = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));

  const filteredScorers = scorers.filter(p => {
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.team?.name && p.team.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const topThree = scorers.slice(0, 3);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-red-950 shadow-md shadow-amber-500/20">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
                <span>Golden Boot Leaderboard</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300">
                  Top Scorers
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official goal rankings and Golden Boot race in the Morning Cup tournament.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-semibold"
          >
            <option value="All">All Positions</option>
            <option value="Forward">Forwards</option>
            <option value="Midfielder">Midfielders</option>
            <option value="Center Back">Defenders</option>
          </select>

          {/* Player Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scorer..."
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm w-40 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length >= 3 && !searchTerm && roleFilter === 'All' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 2nd Place */}
          <div className="order-2 md:order-1 bg-gradient-to-b from-slate-50 to-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-black flex items-center justify-center text-sm shadow-inner mb-3">
              🥈 #2
            </div>
            <div className="font-extrabold text-slate-900 text-lg font-display">
              {topThree[1].name}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {topThree[1].team?.name || 'Tournament Team'}
            </div>
            <div className="mt-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{topThree[1].goals} Goals</span>
            </div>
          </div>

          {/* 1st Place - Golden Boot Leader */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/20 rounded-2xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-2">
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 uppercase tracking-wider">
                Leader
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black flex items-center justify-center text-base shadow-md ring-4 ring-amber-200 mb-3">
              👑 #1
            </div>
            <div className="font-black text-slate-900 text-xl font-display">
              {topThree[0].name}
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-0.5">
              {topThree[0].team?.name || 'Tournament Team'}
            </div>
            <div className="mt-4 flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-400 text-amber-950 text-sm font-extrabold shadow-sm">
              <Trophy className="w-4 h-4 text-amber-900" />
              <span>{topThree[0].goals} Goals</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-3 bg-gradient-to-b from-amber-50/30 to-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-sm shadow-inner mb-3">
              🥉 #3
            </div>
            <div className="font-extrabold text-slate-900 text-lg font-display">
              {topThree[2].name}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {topThree[2].team?.name || 'Tournament Team'}
            </div>
            <div className="mt-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>{topThree[2].goals} Goals</span>
            </div>
          </div>

        </div>
      )}

      {/* Scorers Full Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-2 w-14 text-center">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4 text-center">Position</th>
                <th className="py-3.5 pr-6 pl-4 text-center w-24 font-black text-amber-700">Goals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {filteredScorers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No players found.
                  </td>
                </tr>
              ) : (
                filteredScorers.map((player, index) => {
                  const rank = index + 1;
                  return (
                    <tr 
                      key={player.id} 
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-4 pl-6 pr-2 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                          rank === 1 ? 'bg-amber-400 text-amber-950' :
                          rank === 2 ? 'bg-slate-300 text-slate-800' :
                          rank === 3 ? 'bg-amber-700 text-amber-100' :
                          'text-slate-400 font-semibold'
                        }`}>
                          {rank}
                        </span>
                      </td>

                      {/* Player Name */}
                      <td className="py-4 px-4 font-bold text-slate-800">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{player.name}</span>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-4 px-4 text-slate-600">
                        <span className="font-semibold text-emerald-700">
                          {player.team?.name || 'Tournament Squad'}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeClass(player.role)}`}>
                          {player.role}
                        </span>
                      </td>

                      {/* Goals */}
                      <td className="py-4 pr-6 pl-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-black text-sm border border-amber-200/80 shadow-xs">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>{player.goals || 0}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
