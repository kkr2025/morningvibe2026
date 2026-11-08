import React, { useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  CalendarDays, 
  SunMedium, 
  Zap, 
  ArrowRight,
  LayoutGrid,
  Users,
  Award,
  Shield,
  Lock,
  ChevronDown,
  Clock,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';

function formatTickerTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.round((new Date(date).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 86400000);
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffDays === 0) return `Today ${timeStr}`;
  if (diffDays === 1) return `Tomorrow ${timeStr}`;
  if (diffDays === -1) return `Yesterday`;
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ` ${timeStr}`;
}

export default function Hero({ 
  teams = [], 
  matches = [], 
  players = [], 
  activeTab = 'standings',
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn = false
}) {
  const completedMatches = matches.filter(m => m.status === 'Completed');
  const scheduledMatches = matches.filter(m => m.status === 'Scheduled');
  
  // Next upcoming match (Featured Match like KSL "Today's Match")
  const nextMatch = scheduledMatches[0] || completedMatches[completedMatches.length - 1] || null;
  const nextHome = nextMatch ? (teams.find(t => t.id === nextMatch.home_team_id) || nextMatch.home_team) : null;
  const nextAway = nextMatch ? (teams.find(t => t.id === nextMatch.away_team_id) || nextMatch.away_team) : null;

  // Ticker items (KSL style)
  const recentCompleted = [...completedMatches].sort((a, b) => new Date(b.match_time) - new Date(a.match_time)).slice(0, 5);
  const upcomingScheduled = scheduledMatches.slice(0, 4);

  const tickerItems = [
    ...recentCompleted.map(m => ({
      type: 'result',
      text: `⚽ FT: ${m.home_team?.name || 'Home'} ${m.home_score} – ${m.away_score} ${m.away_team?.name || 'Away'}`
    })),
    ...upcomingScheduled.map(m => ({
      type: 'upcoming',
      text: `⏰ ${formatTickerTime(m.match_time)}: ${m.home_team?.name || 'Home'} vs ${m.away_team?.name || 'Away'} • Pandallur`
    }))
  ];

  const tickerDup = [...tickerItems, ...tickerItems];

  const handleNav = (tabId) => {
    if (onNavigate) onNavigate(tabId);
    setTimeout(() => {
      const el = document.getElementById('tournament-content');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#2a0303] via-[#4d0707] to-[#1a0202] text-white border-b-2 border-amber-500/40 shadow-2xl">
      
      {/* Top Fiery Ticker Bar (Exact KSL Style) */}
      <div className="relative z-30 bg-[#160202] border-b border-red-800/80 py-2 overflow-hidden shadow-inner">
        <div className="ticker-wrap flex items-center">
          <div className="ticker-track">
            {tickerDup.map((item, i) => (
              <span key={i} className="inline-flex items-center mx-5 text-xs font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2.5 animate-ping" />
                <span className={item.type === 'result' ? 'text-amber-200' : 'text-red-200'}>
                  {item.text}
                </span>
                <span className="mx-4 text-red-700 font-black">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Navbar / Utility Line */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-base sm:text-lg font-black tracking-wider text-amber-400 font-display uppercase">
              Morning Cup
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white border border-amber-400/40 text-[10px] font-black uppercase tracking-wider shadow-sm">
              Season 6
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-yellow-400 text-red-950 font-black text-xs transition-all shadow-md flex items-center space-x-1.5 active:scale-95"
          >
            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAdminLoggedIn ? 'Admin Panel Active' : 'Admin Login'}</span>
          </button>
        </div>
      </div>

      {/* Main Hero Showcase (Inspired by Super League Kerala) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 lg:pt-8 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Typography & Headline */}
          <div className="lg:col-span-7 space-y-4 text-left">
            
            {/* Title Block: Morning Cup -> Season 6 -> Morning Football Vibes */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-sport tracking-wider uppercase leading-none text-white drop-shadow-2xl">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                  Morning Cup
                </span>
              </h1>

              <div className="flex items-center space-x-3 pt-1">
                <span className="inline-flex items-center px-4 py-1 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-white font-black text-lg sm:text-2xl tracking-widest font-sport uppercase shadow-lg border border-amber-300/40">
                  Season 6
                </span>
                <span className="h-0.5 w-12 bg-amber-400/30 hidden sm:inline-block" />
              </div>

              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-100 font-display tracking-tight drop-shadow-md pt-1">
                Morning Football Vibes
              </div>

              <p className="text-xs sm:text-sm text-amber-100/80 max-w-xl leading-relaxed font-medium pt-1">
                Six elite squads competing for glory with real-time standings, matchday lineups, cards & disciplinary suspensions, and Golden Boot tracking.
              </p>
            </div>

            {/* Pro-Level Navigation Buttons (Clean Pills like KSL) */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              
              <button
                onClick={() => handleNav('standings')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-2 active:scale-95 ${
                  activeTab === 'standings'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Points Table</span>
              </button>

              <button
                onClick={() => handleNav('matches')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-2 active:scale-95 ${
                  activeTab === 'matches'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>Fixtures & Results</span>
              </button>

              <button
                onClick={() => handleNav('lineups')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-2 active:scale-95 ${
                  activeTab === 'lineups'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-amber-400" />
                <span>Match Lineups</span>
              </button>

              <button
                onClick={() => handleNav('discipline')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-2 active:scale-95 ${
                  activeTab === 'discipline'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Cards & Bans</span>
              </button>

              <button
                onClick={() => handleNav('scorers')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-2 active:scale-95 ${
                  activeTab === 'scorers'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Golden Boot</span>
              </button>

              <button
                onClick={() => handleNav('teams')}
                className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-2 active:scale-95 ${
                  activeTab === 'teams'
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-red-950 ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>All 6 Squads</span>
              </button>

            </div>

          </div>

          {/* Right Column: User's Official Poster Artwork */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Outer Golden Glow Halo */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-red-600 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition duration-500" />
              
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300/80 shadow-2xl bg-black">
                <img
                  src="/hero-banner.svg"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/hero-banner.jpg";
                  }}
                  alt="Morning Football Cup Season 6"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Featured "TODAY'S MATCH / NEXT MATCH" Card (Exact KSL Style) */}
        {nextMatch && (
          <div className="mt-8 bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-l-4 border-red-600 text-slate-800">
            <div className="text-[11px] font-black uppercase tracking-wider text-red-700 mb-2 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>{nextMatch.status === 'Completed' ? 'LATEST MATCH RESULT' : 'FEATURED UPCOMING FIXTURE'}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Teams Matchup */}
              <div className="flex items-center space-x-4 sm:space-x-6 flex-1 min-w-0">
                {/* Home */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  {nextHome?.logo ? (
                    <img src={nextHome.logo} alt={nextHome.name} className="w-10 h-10 rounded-xl object-cover border border-amber-300 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center shadow-sm">
                      {nextHome?.badge || '⚽'}
                    </div>
                  )}
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                    {nextHome?.name || 'Home Squad'}
                  </span>
                </div>

                {/* Score or VS */}
                <div className="px-2 py-1 rounded-xl bg-slate-900 text-amber-300 font-black text-xs sm:text-sm tracking-wider flex-shrink-0">
                  {nextMatch.status === 'Completed' ? `${nextMatch.home_score} – ${nextMatch.away_score}` : 'VS'}
                </div>

                {/* Away */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  {nextAway?.logo ? (
                    <img src={nextAway.logo} alt={nextAway.name} className="w-10 h-10 rounded-xl object-cover border border-amber-300 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center shadow-sm">
                      {nextAway?.badge || '⚡'}
                    </div>
                  )}
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                    {nextAway?.name || 'Away Squad'}
                  </span>
                </div>
              </div>

              {/* Match Details & Action */}
              <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                <div className="text-left md:text-right text-xs">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5 md:justify-end">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>{formatTickerTime(nextMatch.match_time)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    📍 Morning Turf, Pandallur
                  </div>
                </div>

                <button
                  onClick={() => handleNav('lineups')}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-colors flex-shrink-0"
                >
                  View Lineups
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
