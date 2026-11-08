import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Flame, 
  Award,
  CircleDot
} from 'lucide-react';
import { getRoleBadgeClass } from '../lib/utils';

export default function TeamsList({ teams = [], players = [] }) {
  const [expandedTeamId, setExpandedTeamId] = useState(teams[0]?.id || null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
          <Users className="w-5 h-5 stroke-[2.5] text-amber-200" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight flex items-center space-x-2">
            <span>Tournament Squads & Rosters</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-extrabold uppercase tracking-wider border border-red-300">
              {teams.length} Squads
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore all 6 squads, player roles, team managers/coaches, and individual goals.
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teams.map((team) => {
          const teamPlayers = players.filter(p => p.team_id === team.id);
          const isExpanded = expandedTeamId === team.id;
          const coach = teamPlayers.find(p => p.role === 'Coach');
          const nonCoaches = teamPlayers.filter(p => p.role !== 'Coach');
          const totalGoals = teamPlayers.reduce((sum, p) => sum + (p.goals || 0), 0);

          return (
            <div
              key={team.id}
              className="bg-white rounded-3xl border border-red-100/90 shadow-md hover:shadow-xl hover:border-amber-400 transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div 
                onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                className="p-5 cursor-pointer bg-gradient-to-r from-red-50/30 via-white to-amber-50/30 hover:bg-amber-50/50 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300 flex-shrink-0 shadow-sm bg-white"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: team.color || '#dc2626' }}
                    >
                      {team.badge || '⚽'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg font-display truncate">
                      {team.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <span>{teamPlayers.length} Members</span>
                      <span>•</span>
                      <span className="text-amber-800 font-extrabold">{team.points || 0} Pts</span>
                      <span>•</span>
                      <span>{team.wins || 0}W {team.draws || 0}D {team.losses || 0}L</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs font-bold text-amber-700 hidden sm:inline">
                    {isExpanded ? 'Hide' : 'View Squad'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-amber-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Squad View */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 animate-fade-in-up">
                  
                  {/* Coach Banner */}
                  {coach && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-amber-100/80 to-yellow-100/60 rounded-2xl border border-amber-300/80 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-xl bg-amber-500 text-red-950 font-black flex items-center justify-center text-xs">
                          👔
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900">{coach.name}</div>
                          <div className="text-[10px] text-amber-900 font-bold uppercase">Head Coach / Team Tactician</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black bg-amber-400/80 text-red-950 px-2 py-0.5 rounded-full uppercase">
                        Coach
                      </span>
                    </div>
                  )}

                  {/* Squad Players Table/List */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1 flex justify-between">
                      <span>Player & Role</span>
                      <span>Goals</span>
                    </div>

                    {nonCoaches.map((player) => (
                      <div
                        key={player.id}
                        className="px-3 py-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs hover:border-amber-300 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <CircleDot className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-bold text-slate-800">{player.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getRoleBadgeClass(player.role)}`}>
                            {player.role}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {player.goals > 0 ? (
                            <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                              ⚽ {player.goals}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Squad Summary Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Squad Total Goals: <strong className="text-slate-800 font-bold">{totalGoals}</strong></span>
                    <span>Goal Difference: <strong className="text-slate-800 font-bold">{(team.goals_for || 0) - (team.goals_against || 0)}</strong></span>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
