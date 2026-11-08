import React, { useState } from 'react';
import {
  X, Calendar, Users, CheckCircle2, Clock, Trophy,
  TrendingUp, Minus, TrendingDown, Shield
} from 'lucide-react';
import { getRoleBadgeClass, formatRelativeMatchTime } from '../lib/utils';

function TeamDetailModal({ team, matches = [], players = [], teams = [], isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('schedule');

  if (!isOpen || !team) return null;

  // All matches involving this team
  const teamMatches = matches
    .filter(m => m.home_team_id === team.id || m.away_team_id === team.id)
    .sort((a, b) => new Date(a.match_time) - new Date(b.match_time));

  const completedMatches = teamMatches.filter(m => m.status === 'Completed');
  const scheduledMatches = teamMatches.filter(m => m.status === 'Scheduled');

  // Squad
  const squad = players.filter(p => p.team_id === team.id);
  const coach = squad.find(p => p.role === 'Coach');
  const fieldPlayers = squad.filter(p => p.role !== 'Coach');

  const gd = (team.goals_for || 0) - (team.goals_against || 0);

  const getTeamName = (id) => teams.find(t => t.id === id)?.name || '—';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-modal-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100"
          style={{ background: `linear-gradient(135deg, ${team.color || '#16a34a'}18, white)` }}
        >
          <div className="flex items-center space-x-3.5">
            {/* Team logo or badge */}
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 shadow-md flex-shrink-0"
                style={{ borderColor: team.color || '#16a34a' }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: team.color || '#16a34a' }}
              >
                {team.badge || team.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display leading-tight">
                {team.name}
              </h2>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-200 text-red-950 text-xs font-black border border-amber-300 shadow-sm">
                  {team.points || 0} Pts
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {team.wins || 0}W · {team.draws || 0}D · {team.losses || 0}L
                </span>
                <span className={`text-xs font-bold ${gd > 0 ? 'text-emerald-600' : gd < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  GD: {gd > 0 ? `+${gd}` : gd}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/60">
          {[
            { label: 'Played', value: team.matches_played || 0 },
            { label: 'GF', value: team.goals_for || 0 },
            { label: 'GA', value: team.goals_against || 0 },
            { label: 'GD', value: gd > 0 ? `+${gd}` : gd },
          ].map(stat => (
            <div key={stat.label} className="text-center py-2.5">
              <div className="text-base font-black text-slate-800">{stat.value}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-white px-5">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center space-x-1.5 px-3 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule & Results</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{teamMatches.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('squad')}
            className={`flex items-center space-x-1.5 px-3 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'squad' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" />
            <span>Squad Roster</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{squad.length}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">

          {/* SCHEDULE TAB */}
          {activeTab === 'schedule' && (
            <>
              {teamMatches.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No matches scheduled yet.</div>
              ) : (
                teamMatches.map(m => {
                  const isHome = m.home_team_id === team.id;
                  const opponent = isHome
                    ? (m.away_team?.name || getTeamName(m.away_team_id))
                    : (m.home_team?.name || getTeamName(m.home_team_id));
                  const teamScore = isHome ? m.home_score : m.away_score;
                  const oppScore = isHome ? m.away_score : m.home_score;
                  const isCompleted = m.status === 'Completed';
                  const teamWon = isCompleted && teamScore > oppScore;
                  const teamLost = isCompleted && teamScore < oppScore;
                  const isDraw = isCompleted && teamScore === oppScore;

                  return (
                    <div key={m.id} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${isCompleted ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/50 border-amber-200/60'}`}>
                      {/* Result indicator */}
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                          teamWon ? 'bg-emerald-100 text-emerald-800' :
                          teamLost ? 'bg-rose-100 text-rose-700' :
                          isDraw ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {teamWon ? 'W' : teamLost ? 'L' : isDraw ? 'D' : isHome ? 'H' : 'A'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {isHome ? 'vs ' : '@ '}{opponent}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeMatchTime(m.match_time)}</span>
                            <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold ${isHome ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {isHome ? 'Home' : 'Away'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score or Status */}
                      {isCompleted ? (
                        <div className="text-center">
                          <div className="font-black text-slate-900 text-base tabular-nums">
                            {teamScore} – {oppScore}
                          </div>
                          <div className={`text-[10px] font-bold ${teamWon ? 'text-emerald-600' : teamLost ? 'text-rose-600' : 'text-amber-600'}`}>
                            {teamWon ? '🏆 Win' : teamLost ? 'Loss' : '🤝 Draw'}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                          Scheduled
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* SQUAD TAB */}
          {activeTab === 'squad' && (
            <>
              {coach && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-900">Head Coach: {coach.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">Tactician</span>
                </div>
              )}
              {fieldPlayers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No players registered yet.</div>
              ) : (
                <div className="space-y-1.5">
                  {fieldPlayers.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${getRoleBadgeClass(p.role)}`}>{p.role}</span>
                        <span className="text-sm font-bold text-slate-800">{p.name}</span>
                      </div>
                      {p.goals > 0 && (
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          ⚽ {p.goals} {p.goals === 1 ? 'goal' : 'goals'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamDetailModal;
