import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CalendarPlus, 
  UserPlus, 
  PlusCircle, 
  Trophy, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  Users,
  Shield,
  Zap,
  Database,
  BookOpen
} from 'lucide-react';
import ManageTeams from './ManageTeams';
import ManageMatches from './ManageMatches';
import DisciplinarySettings from './DisciplinarySettings';
import TournamentBook from './TournamentBook';
import AddPlayerForm from './AddPlayerForm';
import ManageData from './ManageData';

export default function AdminDashboard({ 
  teams = [], 
  players = [], 
  matches = [], 
  selectedMatch = null,
  onDataChanged, 
  onExitAdmin,
  onLogout 
}) {
  const [adminSubTab, setAdminSubTab] = useState('matches');

  const pendingMatches = matches.filter(m => m.status === 'Scheduled');

  return (
    <div className="space-y-6">
      
      {/* Top Admin Banner — Red & Gold Theme */}
      <div className="no-print bg-gradient-to-r from-red-950 via-red-900 to-amber-950 rounded-3xl p-5 sm:p-8 text-white shadow-2xl border border-amber-500/30 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 border border-amber-300/40 flex items-center justify-center text-red-950 shadow-md flex-shrink-0">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  Admin Command Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100/80 mt-0.5">
                Full match lifecycle manager: schedule, bulk-generate, live list, update score, and team CRUD.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span>Public Dashboard</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-400/30 transition-all"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Admin Navigation Pills */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-2 border-t border-red-800/80 pt-4">
          
          {/* Matches Manager (Create, Bulk, Update, Delete, Live List) */}
          <button
            onClick={() => setAdminSubTab('matches')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              adminSubTab === 'matches'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-red-900/60 text-amber-100 hover:bg-red-800/80 border border-red-700/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Matches (All-in-One)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              adminSubTab === 'matches' ? 'bg-red-950 text-amber-300' : 'bg-amber-400/30 text-amber-200'
            }`}>
              {matches.length}
            </span>
          </button>

          {/* Teams (View, Add, Edit, Delete) Tab */}
          <button
            onClick={() => setAdminSubTab('teams')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              adminSubTab === 'teams'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-red-900/60 text-amber-100 hover:bg-red-800/80 border border-red-700/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Manage Teams (CRUD)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              adminSubTab === 'teams' ? 'bg-red-950 text-amber-300' : 'bg-amber-400/30 text-amber-200'
            }`}>
              {teams.length}
            </span>
          </button>

          {/* Cards & Bans Disciplinary Settings */}
          <button
            onClick={() => setAdminSubTab('discipline')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              adminSubTab === 'discipline'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-red-900/60 text-amber-100 hover:bg-red-800/80 border border-red-700/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cards & Bans Settings</span>
          </button>

          {/* Tournament Book / A4 PDF Reports */}
          <button
            onClick={() => setAdminSubTab('book')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              adminSubTab === 'book'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-red-900/60 text-amber-100 hover:bg-red-800/80 border border-red-700/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Book (A4 PDF)</span>
          </button>

          {/* Add Player */}
          <button
            onClick={() => setAdminSubTab('player')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              adminSubTab === 'player'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-red-900/60 text-amber-100 hover:bg-red-800/80 border border-red-700/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Player</span>
          </button>

          {/* Database / Backup / Reset */}
          <button
            onClick={() => setAdminSubTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 ${
              adminSubTab === 'settings'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-red-900/60 text-amber-100 hover:bg-red-800/80 border border-red-700/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup & Data Reset</span>
          </button>

        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-5xl mx-auto">
        
        {/* Unified Match Manager */}
        {adminSubTab === 'matches' && (
          <ManageMatches
            teams={teams}
            matches={matches}
            players={players}
            onMatchesChanged={onDataChanged}
          />
        )}

        {/* Teams CRUD */}
        {adminSubTab === 'teams' && (
          <ManageTeams
            teams={teams}
            players={players}
            matches={matches}
            onTeamsChanged={onDataChanged}
          />
        )}

        {/* Disciplinary Rules & Cards Manager */}
        {adminSubTab === 'discipline' && (
          <DisciplinarySettings
            players={players}
            teams={teams}
            matches={matches}
            onDataChanged={onDataChanged}
          />
        )}

        {/* Tournament Book / A4 PDF Reports */}
        {adminSubTab === 'book' && (
          <TournamentBook
            matches={matches}
            teams={teams}
            players={players}
          />
        )}

        {/* Add Player */}
        {adminSubTab === 'player' && (
          <AddPlayerForm
            teams={teams}
            onPlayerAdded={onDataChanged}
          />
        )}

        {/* Settings / Reset */}
        {adminSubTab === 'settings' && (
          <ManageData
            matches={matches}
            players={players}
            teams={teams}
            onDataRefreshed={onDataChanged}
          />
        )}
      </div>

    </div>
  );
}
