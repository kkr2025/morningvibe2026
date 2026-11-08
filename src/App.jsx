import React, { useState, useEffect, useCallback } from 'react';
import Hero from './components/Hero';
import StandingsTable from './components/StandingsTable';
import MatchCenter from './components/MatchCenter';
import TopScorers from './components/TopScorers';
import TeamsList from './components/TeamsList';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLoginModal from './components/Admin/AdminLoginModal';
import SupabaseInfoModal from './components/SupabaseInfoModal';
import TeamDetailModal from './components/TeamDetailModal';
import MatchLineups from './components/MatchLineups';
import DisciplinaryCenter from './components/DisciplinaryCenter';
import ScrollToTop from './components/ScrollToTop';
import { getTeams, getPlayers, getMatches, isSupabaseConfigured } from './lib/supabase';
import { 
  Trophy, 
  CalendarDays, 
  LayoutGrid, 
  Award, 
  Users, 
  RefreshCw, 
  AlertCircle, 
  Lock, 
  ShieldCheck,
  Database,
  Shirt,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['standings', 'matches', 'lineups', 'discipline', 'combined', 'scorers', 'teams', 'admin'].includes(hash) ? hash : 'standings';
  });

  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('mfv_admin_auth') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedMatchForAdmin, setSelectedMatchForAdmin] = useState(null);

  // Team detail modal state
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Sync hash with active tab
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Load all tournament data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [teamsData, playersData, matchesData] = await Promise.all([
        getTeams(),
        getPlayers(),
        getMatches(),
      ]);

      setTeams(teamsData || []);
      setPlayers(playersData || []);
      setMatches(matchesData || []);
    } catch (err) {
      console.error('Error loading tournament data:', err);
      setLoadError('Failed to load tournament data. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Admin Login Success
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('mfv_admin_auth', 'true');
    setIsLoginModalOpen(false);
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('mfv_admin_auth');
    if (activeTab === 'admin') {
      setActiveTab('standings');
    }
  };

  // Jump from match center to admin score update
  const handleSelectMatchToUpdate = (match) => {
    setSelectedMatchForAdmin(match);
    if (!isAdminLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      setActiveTab('admin');
    }
  };

  const scrollToContent = (tabId) => {
    setActiveTab(tabId);
    setTimeout(() => {
      const el = document.getElementById('tournament-content');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 antialiased selection:bg-amber-400 selection:text-red-950">
      
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with Integrated Buttons & No Bulky Top Navbar */}
        {activeTab !== 'admin' && (
          <Hero
            teams={teams}
            matches={matches}
            players={players}
            activeTab={activeTab}
            isAdminLoggedIn={isAdminLoggedIn}
            onNavigate={scrollToContent}
            onOpenAdmin={() => {
              if (isAdminLoggedIn) setActiveTab('admin');
              else setIsLoginModalOpen(true);
            }}
          />
        )}

        {/* Content Section Container */}
        <div id="tournament-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Quick-Nav Sticky Pill Bar when scrolling or in Admin mode */}
          <div className="no-print mb-8 flex items-center justify-between flex-wrap gap-3 bg-red-950/70 p-2 sm:p-2.5 rounded-2xl border border-amber-500/30 backdrop-blur-md shadow-xl">
            <div className="flex items-center flex-wrap gap-1.5">
              <button
                onClick={() => scrollToContent('standings')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  activeTab === 'standings'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-md'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Points Table</span>
              </button>

              <button
                onClick={() => scrollToContent('matches')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  activeTab === 'matches'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-md'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </button>

              <button
                onClick={() => scrollToContent('lineups')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  activeTab === 'lineups'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-md'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Lineups</span>
              </button>

              <button
                onClick={() => scrollToContent('discipline')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  activeTab === 'discipline'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-md'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Cards & Bans</span>
              </button>

              <button
                onClick={() => scrollToContent('combined')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  activeTab === 'combined'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-md'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Table + Schedule</span>
              </button>

              <button
                onClick={() => scrollToContent('scorers')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  activeTab === 'scorers'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-md'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Top Scorers</span>
              </button>

              <button
                onClick={() => scrollToContent('teams')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                  activeTab === 'teams'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-950 shadow-md'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Squads</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {isAdminLoggedIn ? (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white ring-2 ring-amber-400'
                      : 'bg-red-800 text-amber-200 hover:bg-red-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/50 transition-all flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700">
              <RefreshCw className="w-9 h-9 text-amber-400 animate-spin mb-3" />
              <p className="text-sm font-bold text-amber-200">Loading Morning Cup tournament stats...</p>
            </div>
          )}

          {/* Error Banner */}
          {loadError && !isLoading && (
            <div className="p-4 mb-6 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span className="text-sm font-semibold">{loadError}</span>
              </div>
              <button
                onClick={loadData}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Content Body */}
          {!isLoading && (
            <>
              {/* 1. Points Table Only */}
              {activeTab === 'standings' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                  <StandingsTable
                    teams={teams}
                    matches={matches}
                    onSelectTeam={(team) => {
                      setSelectedTeam(team);
                      setIsTeamModalOpen(true);
                    }}
                  />
                </div>
              )}

              {/* 2. Match Center / Schedule Only */}
              {activeTab === 'matches' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                  <MatchCenter
                    matches={matches}
                    teams={teams}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onSelectMatchToUpdate={handleSelectMatchToUpdate}
                    onViewLineup={() => scrollToContent('lineups')}
                  />
                </div>
              )}

              {/* 2b. Matchday Lineups */}
              {activeTab === 'lineups' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                  <MatchLineups
                    matches={matches}
                    teams={teams}
                    players={players}
                  />
                </div>
              )}

              {/* 2c. Disciplinary Center (Cards & Suspensions) */}
              {activeTab === 'discipline' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                  <DisciplinaryCenter
                    players={players}
                    teams={teams}
                  />
                </div>
              )}

              {/* 3. COMBINED VIEW: Points Table & Schedule Together On Screen! */}
              {activeTab === 'combined' && (
                <div className="space-y-10">
                  
                  {/* Section A: Points Table */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                        Part 1: League Rankings
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Real-time Goal Difference Tiebreakers
                      </span>
                    </div>
                    <StandingsTable
                      teams={teams}
                      matches={matches}
                      onSelectTeam={(team) => {
                        setSelectedTeam(team);
                        setIsTeamModalOpen(true);
                      }}
                    />
                  </div>

                  {/* Section B: Fixtures & Schedule */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full">
                        Part 2: Schedule & Fixtures
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Upcoming and Completed Matches
                      </span>
                    </div>
                    <MatchCenter
                      matches={matches}
                      teams={teams}
                      isAdminLoggedIn={isAdminLoggedIn}
                      onSelectMatchToUpdate={handleSelectMatchToUpdate}
                      onViewLineup={() => scrollToContent('lineups')}
                    />
                  </div>

                </div>
              )}

              {/* 4. Top Scorers */}
              {activeTab === 'scorers' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                  <TopScorers
                    players={players}
                    teams={teams}
                  />
                </div>
              )}

              {/* 5. Squads */}
              {activeTab === 'teams' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-red-100">
                  <TeamsList
                    teams={teams}
                    players={players}
                  />
                </div>
              )}

              {/* 6. Admin Command Center */}
              {activeTab === 'admin' && (
                isAdminLoggedIn ? (
                  <AdminDashboard
                    teams={teams}
                    players={players}
                    matches={matches}
                    selectedMatch={selectedMatchForAdmin}
                    onDataChanged={loadData}
                    onExitAdmin={() => setActiveTab('standings')}
                    onLogout={handleAdminLogout}
                  />
                ) : (
                  <div className="bg-gradient-to-b from-red-950 via-slate-900 to-black rounded-3xl p-10 text-center max-w-lg mx-auto border-2 border-amber-500/40 shadow-2xl">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 text-red-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                      <Trophy className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl font-black text-white font-display">
                      Tournament Admin Access
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-200/80 mt-2 leading-relaxed">
                      Please enter your administrator passcode to manage squads, schedule matches, and enter final scores.
                    </p>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 transition-all active:scale-95"
                    >
                      Enter Admin Password
                    </button>
                  </div>
                )
              )}
            </>
          )}

        </div>
      </main>

      {/* Global Modals */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <SupabaseInfoModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Team Detail Modal — opens when a row in StandingsTable is clicked */}
      <TeamDetailModal
        team={selectedTeam}
        matches={matches}
        players={players}
        teams={teams}
        isOpen={isTeamModalOpen}
        onClose={() => { setIsTeamModalOpen(false); setSelectedTeam(null); }}
      />

      {/* Floating Scroll-to-Top Button */}
      <ScrollToTop />

      {/* Footer: A Lugh Lab Creation & Copyright 2026 */}
      <footer className="bg-[#120202] border-t-2 border-amber-500/30 mt-auto text-amber-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            
            {/* Left: Tournament Identity */}
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start space-x-2.5">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-red-950 flex items-center justify-center font-black text-sm shadow-md">
                  ⚽
                </span>
                <span className="font-black text-white font-sport text-xl tracking-wider uppercase">
                  Morning Cup · Season 6
                </span>
              </div>
              <p className="text-xs text-amber-200/60 font-medium">
                Morning Football Vibes · Pandallur, Malappuram, Kerala
              </p>
            </div>

            {/* Center: Lugh Lab Creation Branding Badge */}
            <div className="flex flex-col items-center space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border border-amber-500/40 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-display">
                  A LUGH LAB CREATION
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-amber-200/50 font-medium">
                Crafted for Grassroots Football Excellence
              </div>
            </div>

            {/* Right: Copyright 2026 & Navigation */}
            <div className="text-xs space-y-1 text-center md:text-right font-medium">
              <div className="text-slate-300 font-semibold">
                © 2026 Morning Football Vibes. All rights reserved.
              </div>
              <div className="flex items-center justify-center md:justify-end space-x-3 text-[11px] text-amber-400">
                <button onClick={() => scrollToContent('standings')} className="hover:underline">Standings</button>
                <span>•</span>
                <button onClick={() => scrollToContent('matches')} className="hover:underline">Schedule</button>
                <span>•</span>
                <button onClick={() => scrollToContent('lineups')} className="hover:underline">Lineups</button>
                <span>•</span>
                <button 
                  onClick={() => {
                    if (isAdminLoggedIn) setActiveTab('admin');
                    else setIsLoginModalOpen(true);
                  }} 
                  className="hover:underline text-amber-300 font-bold"
                >
                  Admin
                </button>
              </div>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
