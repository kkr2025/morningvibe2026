import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  UserX, 
  CheckCircle, 
  Shield, 
  Filter,
  Info
} from 'lucide-react';
import { getDisciplinarySettings } from '../lib/supabase';

export default function DisciplinaryCenter({ players = [], teams = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'suspended', 'carded'

  const settings = getDisciplinarySettings();

  const cardedPlayers = players.filter(p => (p.yellow_cards > 0 || p.red_cards > 0 || p.is_suspended));
  const suspendedPlayers = players.filter(p => p.is_suspended);

  const displayedPlayers = players.filter(p => {
    if (filter === 'suspended') return p.is_suspended;
    if (filter === 'carded') return p.yellow_cards > 0 || p.red_cards > 0;
    return true;
  }).filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const tName = teams.find(t => t.id === p.team_id)?.name || '';
    return p.name.toLowerCase().includes(term) || tName.toLowerCase().includes(term);
  }).sort((a, b) => {
    // Sort suspended first, then red cards desc, then yellow cards desc
    if (a.is_suspended !== b.is_suspended) return a.is_suspended ? -1 : 1;
    if ((b.red_cards || 0) !== (a.red_cards || 0)) return (b.red_cards || 0) - (a.red_cards || 0);
    return (b.yellow_cards || 0) - (a.yellow_cards || 0);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5 text-amber-200 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
                <span>Disciplinary Center & Match Bans</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-black uppercase border border-red-300">
                  Fair Play
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official tournament yellow & red card tallies, suspension rules, and player match eligibility.
              </p>
            </div>
          </div>
        </div>

        {/* Rule Summary Badge */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl px-4 py-2 text-xs flex items-center space-x-2 text-amber-900 font-bold self-start sm:self-auto shadow-sm">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Rule: {settings.yellow_card_limit} Yellows = 1 Match Ban | Red = {settings.red_card_suspension_matches} Match Ban</span>
        </div>
      </div>

      {/* Active Suspensions Banner if any */}
      {suspendedPlayers.length > 0 ? (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-black rounded-3xl p-5 sm:p-6 text-white border-2 border-red-500/60 shadow-xl">
          <div className="flex items-center space-x-2 text-red-400 font-black text-xs uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Currently Serving Matchday Suspensions ({suspendedPlayers.length} Players)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {suspendedPlayers.map((player) => {
              const team = teams.find(t => t.id === player.team_id);
              return (
                <div key={player.id} className="bg-white/10 rounded-2xl p-3 border border-red-500/30 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-white text-sm">⛔ {player.name}</div>
                    <div className="text-[11px] text-amber-300 font-semibold">{team?.name || 'Squad'}</div>
                    <div className="text-[10px] text-red-200 mt-0.5">{player.suspension_reason || 'Banned for next fixture'}</div>
                  </div>
                  <span className="px-2 py-1 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase">
                    {player.suspension_matches_remaining || 1} M Remaining
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-center space-x-2 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-amber-600" />
          <span>All tournament players are currently eligible. No active card suspensions.</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-amber-400 text-red-950 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Players ({players.length})
          </button>
          <button
            onClick={() => setFilter('carded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'carded' ? 'bg-amber-400 text-red-950 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Penalized ({cardedPlayers.length})
          </button>
          <button
            onClick={() => setFilter('suspended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'suspended' ? 'bg-amber-400 text-red-950 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suspended ({suspendedPlayers.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search player or squad..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Disciplinary Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-red-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-200 border-b border-amber-500/30 text-[11px] sm:text-xs font-black uppercase tracking-wider">
                <th className="py-4 pl-4 sm:pl-6 pr-2">Player</th>
                <th className="py-4 px-3">Squad</th>
                <th className="py-4 px-3">Position</th>
                <th className="py-4 px-3 text-center">🟨 Yellow Cards</th>
                <th className="py-4 px-3 text-center">🟥 Red Cards</th>
                <th className="py-4 pr-4 sm:pr-6 pl-3 text-center">Eligibility / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
              {displayedPlayers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400 text-sm">
                    No matching players found.
                  </td>
                </tr>
              ) : (
                displayedPlayers.map((player) => {
                  const team = teams.find(t => t.id === player.team_id);
                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-amber-50/50 transition-colors ${
                        player.is_suspended ? 'bg-red-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 pl-4 sm:pl-6 pr-2">
                        <div className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                          <span>{player.name}</span>
                          {player.is_suspended && <span className="text-red-600 font-bold">⛔</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-700">{team?.name || '—'}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-xs text-slate-500 font-semibold">{player.role}</span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {player.yellow_cards > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-900 font-black text-xs border border-yellow-300">
                            <span>🟨</span>
                            <span>{player.yellow_cards}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {player.red_cards > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-900 font-black text-xs border border-red-300">
                            <span>🟥</span>
                            <span>{player.red_cards}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">0</span>
                        )}
                      </td>

                      <td className="py-3.5 pr-4 sm:pr-6 pl-3 text-center">
                        {player.is_suspended ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs shadow-sm">
                            <span>⛔ Banned ({player.suspension_matches_remaining || 1} M)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-green-100 text-green-900 font-bold text-xs">
                            <span>Eligible</span>
                          </span>
                        )}
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
