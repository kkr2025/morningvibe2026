import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  BookOpen, 
  Calendar, 
  Users, 
  ShieldAlert, 
  Trophy, 
  Shirt, 
  CheckCircle2, 
  Clock, 
  Info, 
  Filter, 
  Award,
  Crown,
  Scale,
  FileCheck,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatMatchTime } from '../../lib/utils';
import { getDisciplinarySettings } from '../../lib/supabase';

export default function TournamentBook({ matches = [], teams = [], players = [] }) {
  const [selectedSheet, setSelectedSheet] = useState('all'); // 'all', '1', '2', '3', '4', '5'
  const [viewMode, setViewMode] = useState('a4'); // 'a4' (authentic paper preview) or 'dense' (fluid web)
  const [selectedDate, setSelectedDate] = useState('all');

  const disciplinaryRules = getDisciplinarySettings();

  // Sort teams by points then goal difference
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      if (b.points !== a.points) return (b.points || 0) - (a.points || 0);
      const gdA = (a.goals_for || 0) - (a.goals_against || 0);
      const gdB = (b.goals_for || 0) - (b.goals_against || 0);
      if (gdB !== gdA) return gdB - gdA;
      return (b.goals_for || 0) - (a.goals_for || 0);
    });
  }, [teams]);

  // Top scorers
  const topScorers = useMemo(() => {
    return [...players]
      .filter(p => (p.goals || 0) > 0)
      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 10);
  }, [players]);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const groups = {};
    const sorted = [...matches].sort((a, b) => new Date(a.match_time || 0) - new Date(b.match_time || 0));

    sorted.forEach(m => {
      const d = m.match_time ? new Date(m.match_time).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Unscheduled Dates';

      if (!groups[d]) groups[d] = [];
      groups[d].push(m);
    });
    return groups;
  }, [matches]);

  const uniqueDates = Object.keys(matchesByDate);

  // Filtered matches for schedule section
  const displayedMatches = useMemo(() => {
    if (selectedDate === 'all') return matches;
    return matchesByDate[selectedDate] || [];
  }, [matches, matchesByDate, selectedDate]);

  // Summary KPIs
  const completedMatches = useMemo(() => matches.filter(m => m.status === 'Completed'), [matches]);
  const totalGoals = useMemo(() => {
    return completedMatches.reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0);
  }, [completedMatches]);

  const totalYellowCards = useMemo(() => {
    return players.reduce((acc, p) => acc + (p.yellow_cards || 0), 0);
  }, [players]);

  const totalRedCards = useMemo(() => {
    return players.reduce((acc, p) => acc + (p.red_cards || 0), 0);
  }, [players]);

  // Suspended & carded players
  const disciplinedPlayers = useMemo(() => {
    return [...players]
      .filter(p => (p.yellow_cards > 0 || p.red_cards > 0 || p.is_suspended))
      .sort((a, b) => ((b.red_cards || 0) * 3 + (b.yellow_cards || 0)) - ((a.red_cards || 0) * 3 + (a.yellow_cards || 0)));
  }, [players]);

  const suspendedPlayers = useMemo(() => {
    return [...players].filter(p => p.is_suspended);
  }, [players]);

  const handlePrint = () => {
    window.print();
  };

  const currentDateString = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  /* -------------------------------------------------------------
     REUSABLE OFFICIAL SHEET HEADER (A4 Publication Style)
     ------------------------------------------------------------- */
  const OfficialSheetHeader = ({ sheetNumber, sheetTitle, sheetSubtitle }) => (
    <div className="border-b-2 border-red-900 pb-3 mb-4 avoid-break">
      {/* Top micro ribbon */}
      <div className="flex items-center justify-between text-[8.5px] uppercase tracking-widest text-slate-500 font-mono pb-1 border-b border-slate-200 mb-2">
        <span className="flex items-center space-x-1.5 font-bold text-red-900">
          <span className="w-2 h-2 rounded-full bg-red-700 inline-block"></span>
          <span>OFFICIAL TOURNAMENT TECHNICAL DOSSIER</span>
        </span>
        <span>DOC REF: MFV/S6/2026-A4 · CONFIDENTIAL & CERTIFIED</span>
        <span>PANDALLUR, KERALA</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {/* Official Crest Badge */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-900 via-red-800 to-amber-700 flex flex-col items-center justify-center text-white border border-amber-400/60 shadow-sm flex-shrink-0">
            <span className="text-[7px] font-black tracking-tighter text-amber-300">MFV</span>
            <Trophy className="w-4 h-4 text-amber-300 stroke-[2.2]" />
            <span className="text-[6.5px] font-black text-amber-200">S-6</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black font-sport uppercase tracking-wider text-red-950 leading-none">
              Morning Football Cup <span className="text-amber-600">★ Season 6</span>
            </h1>
            <div className="text-[10px] font-black text-slate-700 uppercase tracking-wide mt-0.5">
              Morning Football Vibes · Pandallur Turf Ground
            </div>
            <div className="text-[9px] font-medium text-slate-500">
              {sheetSubtitle || 'Official League Records, Fixtures, Squad Registrations & Disciplinary Bulletin'}
            </div>
          </div>
        </div>

        {/* Sheet Number & Metadata Pill */}
        <div className="text-right flex flex-col items-end">
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-red-950 text-amber-300 font-black text-[10px] uppercase tracking-wider">
            <span>SHEET 0{sheetNumber} OF 05</span>
          </div>
          <div className="text-[8.5px] text-slate-500 font-mono mt-1">
            DATE: {currentDateString}
          </div>
        </div>
      </div>

      {/* Sheet Specific Title Bar */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded">
        <span className="text-xs font-black uppercase text-red-950 tracking-wide font-display">
          {sheetTitle}
        </span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          Official Ratified Section
        </span>
      </div>
    </div>
  );

  /* -------------------------------------------------------------
     REUSABLE OFFICIAL SHEET FOOTER (A4 Publication Style)
     ------------------------------------------------------------- */
  const OfficialSheetFooter = ({ sheetNumber }) => (
    <div className="mt-auto pt-3 border-t border-slate-300 text-[8.5px] text-slate-500 flex items-center justify-between font-mono avoid-break">
      <div className="font-bold text-red-950">
        MORNING FOOTBALL CUP · SEASON 6 · OFFICIAL DOSSIER
      </div>
      <div className="font-semibold text-slate-600">
        ✨ A LUGH LAB CREATION · COPYRIGHT © 2026 ✨
      </div>
      <div className="font-black text-slate-800">
        PAGE {sheetNumber} OF 5 · OFFICIAL RECORD
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          ADMIN ON-SCREEN CONTROL BAR (Hidden during printing)
          ======================================================== */}
      <div className="no-print bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xl space-y-5">
        
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-700 via-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-red-600/20 flex-shrink-0">
              <BookOpen className="w-6 h-6 stroke-[2.2] text-amber-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Official Tournament Book & A4 PDF Dossier
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200 text-[10px] font-black uppercase tracking-wider">
                  Pro Publication
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-page, tournament-grade technical dossier with dedicated sheets for Standings, Fixtures, Squads, Disciplinary Decisions & Official Seals.
              </p>
            </div>
          </div>

          {/* Primary Print / Save to Google Drive PDF Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="print-include px-6 py-3 bg-gradient-to-r from-red-700 via-amber-600 to-yellow-500 hover:from-red-600 hover:to-yellow-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-700/25 transition-all flex items-center justify-center space-x-2.5 active:scale-95 cursor-pointer ring-2 ring-amber-300"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print / Save to Google Drive PDF (A4)</span>
            </button>
          </div>
        </div>

        {/* Google Drive PDF Quick Export Guide Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-red-50 border border-amber-300/80 text-xs text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-extrabold text-red-950">Google Drive PDF Generation Workflow:</strong>
              <span className="text-slate-700 ml-1">
                Click <strong>"Print / Save to Google Drive PDF"</strong> → Destination: <strong>"Save to Google Drive"</strong> (or "Save as PDF") → Paper Size: <strong>A4</strong> → Check <strong>"Background graphics"</strong> so crests, badges and borders render crisply without web margins.
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2 text-[11px] font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200">
            <span>Layout: Portrait</span>
            <span>·</span>
            <span>Paper: A4</span>
            <span>·</span>
            <span>Scale: 100%</span>
          </div>
        </div>

        {/* Navigation Sheet Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1" /> View Sheet:
            </span>

            <button
              onClick={() => setSelectedSheet('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedSheet === 'all'
                  ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              Full Dossier (All 5 Sheets)
            </button>

            <button
              onClick={() => setSelectedSheet('1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedSheet === '1'
                  ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              Sheet 1: Standings & Golden Boot
            </button>

            <button
              onClick={() => setSelectedSheet('2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedSheet === '2'
                  ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              Sheet 2: Fixtures & Scoresheet
            </button>

            <button
              onClick={() => setSelectedSheet('3')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedSheet === '3'
                  ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              Sheet 3: Club Squad Rosters
            </button>

            <button
              onClick={() => setSelectedSheet('4')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedSheet === '4'
                  ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              Sheet 4: Disciplinary Bulletin
            </button>

            <button
              onClick={() => setSelectedSheet('5')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                selectedSheet === '5'
                  ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
              }`}
            >
              Sheet 5: Lineups & Official Seal
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('a4')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                viewMode === 'a4' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>A4 Paper Simulation</span>
            </button>
            <button
              onClick={() => setViewMode('dense')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                viewMode === 'dense' ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCheck className="w-3 h-3" />
              <span>Continuous Flow</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================
          DOCUMENT VIEWPORT CONTAINER
          ======================================================== */}
      <div className={viewMode === 'a4' ? 'space-y-8' : 'bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-12'}>
        
        {/* ====================================================
            PAGE / SHEET 1: COVER, EXECUTIVE METRICS & STANDINGS
            ==================================================== */}
        {(selectedSheet === 'all' || selectedSheet === '1') && (
          <div className={`a4-paper-container flex flex-col justify-between ${viewMode === 'dense' ? 'max-w-none shadow-none border-none p-0 min-h-0' : ''}`}>
            
            <div>
              {/* Sheet Header */}
              <OfficialSheetHeader
                sheetNumber="1"
                sheetTitle="BULLETIN 01 · EXECUTIVE LEAGUE TABLE & CHAMPIONSHIP STANDINGS"
                sheetSubtitle="Tournament Overview, Performance Metrics & Golden Boot Leaderboard"
              />

              {/* Tournament Executive Summary Row (KPIs) */}
              <div className="grid grid-cols-6 gap-2 mb-4 avoid-break">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-base font-black text-red-900 font-display leading-tight">{teams.length}</div>
                  <div className="text-[8px] font-bold uppercase text-slate-500">Clubs</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-base font-black text-slate-800 font-display leading-tight">{players.length}</div>
                  <div className="text-[8px] font-bold uppercase text-slate-500">Athletes</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-base font-black text-amber-600 font-display leading-tight">{matches.length}</div>
                  <div className="text-[8px] font-bold uppercase text-slate-500">Fixtures</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-base font-black text-emerald-700 font-display leading-tight">{completedMatches.length}</div>
                  <div className="text-[8px] font-bold uppercase text-slate-500">FT Matches</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-base font-black text-red-800 font-display leading-tight">{totalGoals}</div>
                  <div className="text-[8px] font-bold uppercase text-slate-500">Goals ⚽</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                  <div className="text-base font-black text-amber-700 font-display leading-tight">{totalYellowCards} / {totalRedCards}</div>
                  <div className="text-[8px] font-bold uppercase text-slate-500">Cards 🟨/🟥</div>
                </div>
              </div>

              {/* Official Points Table & Standings */}
              <div className="mb-4 avoid-break">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase text-red-950 flex items-center space-x-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Official League Standings (Standard 3-1-0 Point System)</span>
                  </span>
                  <span className="text-[8.5px] font-semibold text-slate-500">
                    Tie-breaker: Points → Goal Difference → Goals Scored
                  </span>
                </div>

                <table className="w-full text-left border-collapse text-[10.5px] border border-slate-300">
                  <thead>
                    <tr className="bg-red-950 text-amber-200 font-black uppercase text-[9px] border-b border-red-900">
                      <th className="py-1.5 px-2 text-center w-8">Pos</th>
                      <th className="py-1.5 px-3">Squad / Club Name</th>
                      <th className="py-1.5 px-2 text-center w-8" title="Played">P</th>
                      <th className="py-1.5 px-2 text-center w-8" title="Won">W</th>
                      <th className="py-1.5 px-2 text-center w-8" title="Drawn">D</th>
                      <th className="py-1.5 px-2 text-center w-8" title="Lost">L</th>
                      <th className="py-1.5 px-2 text-center w-9" title="Goals For">GF</th>
                      <th className="py-1.5 px-2 text-center w-9" title="Goals Against">GA</th>
                      <th className="py-1.5 px-2 text-center w-9" title="Goal Difference">GD</th>
                      <th className="py-1.5 px-3 text-center w-12 font-black text-amber-300 bg-red-900">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedTeams.map((team, idx) => {
                      const gd = (team.goals_for || 0) - (team.goals_against || 0);
                      const isLeader = idx === 0;

                      return (
                        <tr key={team.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="py-1.5 px-2 text-center font-black text-slate-700">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 font-extrabold text-slate-900 flex items-center space-x-2">
                            <span className="w-4 h-4 rounded bg-red-900 text-amber-200 text-[8px] font-black flex items-center justify-center flex-shrink-0">
                              {team.name.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{team.name}</span>
                            {isLeader && (
                              <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-300 px-1 py-0.2 rounded font-black flex items-center space-x-0.5">
                                <Crown className="w-2.5 h-2.5 text-amber-600 inline mr-0.5" /> Leader
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-center text-slate-700 font-bold">{team.matches_played || 0}</td>
                          <td className="py-1.5 px-2 text-center text-slate-900 font-bold">{team.wins || 0}</td>
                          <td className="py-1.5 px-2 text-center text-slate-500">{team.draws || 0}</td>
                          <td className="py-1.5 px-2 text-center text-slate-500">{team.losses || 0}</td>
                          <td className="py-1.5 px-2 text-center text-slate-700">{team.goals_for || 0}</td>
                          <td className="py-1.5 px-2 text-center text-slate-700">{team.goals_against || 0}</td>
                          <td className="py-1.5 px-2 text-center font-bold">
                            <span className={gd > 0 ? 'text-emerald-700' : gd < 0 ? 'text-red-700' : 'text-slate-600'}>
                              {gd > 0 ? `+${gd}` : gd}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-center font-black text-red-950 text-xs bg-amber-50 border-l border-amber-200">
                            {team.points || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Golden Boot Leaderboard (Top 5 Podium) */}
              <div className="mb-4 avoid-break">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase text-red-950 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Golden Boot Leaderboard (Top Goalscorers)</span>
                  </span>
                  <span className="text-[8.5px] font-bold text-amber-700 uppercase">Season 6 Top Scorers</span>
                </div>

                {topScorers.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-400 italic text-center">
                    No goals recorded yet in tournament database.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {topScorers.slice(0, 6).map((p, i) => {
                      const tm = teams.find(t => t.id === p.team_id)?.name || 'Squad';
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                      return (
                        <div key={p.id} className="p-1.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-black text-slate-700 text-xs w-5 text-center">{medal}</span>
                            <div className="truncate">
                              <div className="font-bold text-slate-900 truncate leading-tight">{p.name}</div>
                              <div className="text-[8.5px] text-slate-500 truncate">{tm} · {p.role}</div>
                            </div>
                          </div>
                          <span className="ml-2 px-2 py-0.5 bg-amber-400 text-red-950 font-black rounded text-[10px] flex-shrink-0">
                            {p.goals} ⚽
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tournament Match Commissioner Initial Box */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-8 text-[9px] text-slate-500 avoid-break">
                <div>
                  <div className="border-b border-slate-300 pb-5 mb-1" />
                  <div className="font-bold uppercase tracking-wider text-slate-800">Match Commissioner Standings Validation</div>
                  <div className="text-[8px] text-slate-400">Date & Signature Verified</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-5 mb-1" />
                  <div className="font-bold uppercase tracking-wider text-slate-800">Tournament Scorer Board Sign-off</div>
                  <div className="text-[8px] text-slate-400">Official Scorers Desk · Morning Turf</div>
                </div>
              </div>

            </div>

            {/* Sheet Footer */}
            <OfficialSheetFooter sheetNumber="1" />
          </div>
        )}

        {/* ====================================================
            PAGE / SHEET 2: DAY-BY-DAY FIXTURES & REFEREE SCORESHEET
            ==================================================== */}
        {(selectedSheet === 'all' || selectedSheet === '2') && (
          <div className={`a4-paper-container flex flex-col justify-between ${viewMode === 'dense' ? 'max-w-none shadow-none border-none p-0 min-h-0' : ''}`}>
            
            <div>
              {/* Sheet Header */}
              <OfficialSheetHeader
                sheetNumber="2"
                sheetTitle="BULLETIN 02 · OFFICIAL MATCHDAY SCHEDULE & REFEREE SCORESHEET"
                sheetSubtitle="Pitch Logistics, Scheduled Fixtures, Referee Record Boxes & Final Scores"
              />

              {/* Regulatory Notice Banner */}
              <div className="p-2 mb-3 bg-red-50/70 border border-red-200 rounded flex items-center justify-between text-[9px] text-red-950 avoid-break">
                <span className="font-bold">
                  ⚠️ REFEREE PROTOCOL: All official results, bookings, and cards must be recorded and signed immediately following the final whistle.
                </span>
                <span className="font-black font-mono text-red-800">TURF 1 · PANDALLUR</span>
              </div>

              {/* Matchday Schedule Ledger */}
              <div className="space-y-3.5 avoid-break">
                {Object.keys(matchesByDate).slice(0, 4).map((dateKey) => {
                  const dayMatches = matchesByDate[dateKey];
                  return (
                    <div key={dateKey} className="space-y-1 avoid-break">
                      
                      {/* Date bar */}
                      <div className="bg-red-950 text-amber-200 px-2.5 py-1 rounded text-[9.5px] font-black uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          <span>{dateKey}</span>
                        </span>
                        <span className="text-[8.5px] font-bold text-amber-300">
                          {dayMatches.length} Matches Scheduled
                        </span>
                      </div>

                      {/* Day Matches Table */}
                      <table className="w-full text-left border-collapse text-[10px] border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 text-[8.5px] uppercase font-black border-b border-slate-200">
                            <th className="py-1.5 px-2 w-20">Time</th>
                            <th className="py-1.5 px-3 text-right">Home Squad</th>
                            <th className="py-1.5 px-2 text-center w-24">Official Score</th>
                            <th className="py-1.5 px-3 text-left">Away Squad</th>
                            <th className="py-1.5 px-2 text-center w-20">Status</th>
                            <th className="py-1.5 px-3 w-36">Referee Sign / Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {dayMatches.map((m, mIdx) => {
                            const h = teams.find(t => t.id === m.home_team_id)?.name || m.home_team?.name || 'Home Club';
                            const a = teams.find(t => t.id === m.away_team_id)?.name || m.away_team?.name || 'Away Club';
                            const isComp = m.status === 'Completed';

                            return (
                              <tr key={m.id || mIdx} className="hover:bg-slate-50/60">
                                <td className="py-1.5 px-2 font-mono font-bold text-slate-700 text-[9.5px]">
                                  {formatMatchTime(m.match_time)}
                                </td>
                                <td className="py-1.5 px-3 text-right font-extrabold text-slate-900">
                                  {h}
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono font-black">
                                  {isComp ? (
                                    <span className="px-2 py-0.5 bg-red-950 text-amber-300 rounded text-xs">
                                      {m.home_score} : {m.away_score}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-300 text-slate-400 rounded text-[9.5px]">
                                      [ &nbsp; ] : [ &nbsp; ]
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 px-3 text-left font-extrabold text-slate-900">
                                  {a}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                                    isComp ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {isComp ? 'Full Time' : 'Scheduled'}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-[8.5px] text-slate-400 border-l border-slate-200">
                                  Ref: ___________________
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                    </div>
                  );
                })}
              </div>

              {/* Pitch Conditions & Referee Commission Sign-off */}
              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-6 text-[9px] text-slate-500 avoid-break">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="font-bold text-slate-800 uppercase mb-1">Turf & Environmental Audit</div>
                  <div className="flex items-center space-x-3 text-[8.5px] text-slate-600">
                    <span>Pitch: Morning Turf 1 (Grassroot)</span>
                    <span>·</span>
                    <span>Lighting: Natural Morning</span>
                    <span>·</span>
                    <span>Ball: FIFA Size 5</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="font-bold text-slate-800 uppercase mb-1">Chief Match Official Sign-Off</div>
                  <div className="text-[8.5px] text-slate-400">
                    Signature: __________________________  Time: _________
                  </div>
                </div>
              </div>

            </div>

            {/* Sheet Footer */}
            <OfficialSheetFooter sheetNumber="2" />
          </div>
        )}

        {/* ====================================================
            PAGE / SHEET 3: OFFICIAL CLUB SQUAD ROSTERS & ATHLETE ELIGIBILITY
            ==================================================== */}
        {(selectedSheet === 'all' || selectedSheet === '3') && (
          <div className={`a4-paper-container flex flex-col justify-between ${viewMode === 'dense' ? 'max-w-none shadow-none border-none p-0 min-h-0' : ''}`}>
            
            <div>
              {/* Sheet Header */}
              <OfficialSheetHeader
                sheetNumber="3"
                sheetTitle="BULLETIN 03 · SQUAD REGISTRATION DOSSIER & ATHLETE ELIGIBILITY"
                sheetSubtitle="Official 6-Club Roster Directory, Player Roles, Jersey Numbers & Disciplinary Verification"
              />

              {/* 6 Clubs Roster Grid (3x2 or 2x3 clean publication cards) */}
              <div className="grid grid-cols-2 gap-3 avoid-break">
                {teams.map((team) => {
                  const teamPlayers = players.filter(p => p.team_id === team.id);
                  const coach = teamPlayers.find(p => p.role === 'Coach');
                  const squadMembers = teamPlayers.filter(p => p.role !== 'Coach');

                  return (
                    <div key={team.id} className="border border-slate-300 rounded p-2.5 bg-white space-y-1.5 avoid-break">
                      
                      {/* Club Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-red-950 text-amber-300 font-black text-[9px] flex items-center justify-center flex-shrink-0">
                            {team.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-xs text-slate-900 leading-tight">{team.name}</div>
                            <div className="text-[8px] text-slate-500">Coach: {coach ? coach.name : 'Technical Staff'}</div>
                          </div>
                        </div>
                        <span className="text-[8.5px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                          {squadMembers.length} Athletes
                        </span>
                      </div>

                      {/* Roster table */}
                      <div className="space-y-0.5 text-[9.5px]">
                        {squadMembers.length === 0 ? (
                          <div className="py-2 text-center text-slate-400 italic text-[8.5px]">No players registered</div>
                        ) : (
                          squadMembers.slice(0, 8).map((p, idx) => (
                            <div key={p.id} className="py-0.5 flex items-center justify-between border-b border-slate-100 last:border-none">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <span className="text-[8px] font-mono text-slate-400 w-3">{idx + 1}.</span>
                                <span className="font-bold text-slate-800 truncate">{p.name}</span>
                                {p.is_suspended && (
                                  <span className="text-[7px] px-1 bg-red-600 text-white font-black rounded">
                                    BANNED
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1.5 text-[8px] flex-shrink-0">
                                <span className="text-slate-500 font-semibold">{p.role}</span>
                                {p.yellow_cards > 0 && <span className="font-bold text-amber-700">🟨{p.yellow_cards}</span>}
                                {p.red_cards > 0 && <span className="font-bold text-red-700">🟥{p.red_cards}</span>}
                                {p.goals > 0 && <span className="font-black text-slate-900">⚽{p.goals}</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Team Captain / Manager Sign-off */}
                      <div className="pt-1 border-t border-slate-200 text-[8px] text-slate-400 flex items-center justify-between">
                        <span>Captain Sign: ____________</span>
                        <span className="text-emerald-700 font-bold">✓ VERIFIED</span>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Roster Registration Certification */}
              <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-[8.5px] text-slate-600 flex items-center justify-between avoid-break">
                <span>All squads have met the mandatory 7-a-side registration criteria under Morning Football Cup Season 6 regulations.</span>
                <span className="font-black text-red-950 uppercase">OFFICIAL REGISTRAR CERTIFIED</span>
              </div>

            </div>

            {/* Sheet Footer */}
            <OfficialSheetFooter sheetNumber="3" />
          </div>
        )}

        {/* ====================================================
            PAGE / SHEET 4: DISCIPLINARY TRIBUNAL & SUSPENSIONS BULLETIN
            ==================================================== */}
        {(selectedSheet === 'all' || selectedSheet === '4') && (
          <div className={`a4-paper-container flex flex-col justify-between ${viewMode === 'dense' ? 'max-w-none shadow-none border-none p-0 min-h-0' : ''}`}>
            
            <div>
              {/* Sheet Header */}
              <OfficialSheetHeader
                sheetNumber="4"
                sheetTitle="BULLETIN 04 · DISCIPLINARY TRIBUNAL & SANCTIONS BULLETIN"
                sheetSubtitle="Official Card Accumulation Register, Suspensions Notice & Fair Play Standings"
              />

              {/* Official Fair Play Regulations Notice Box */}
              <div className="p-2.5 bg-red-50/90 border border-red-300 rounded mb-3 text-red-950 text-[9.5px] space-y-1 avoid-break">
                <div className="font-black uppercase tracking-wider text-[9px] text-red-900 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                  <span>Official Fair Play & Disciplinary Governance Code (Season 6)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-medium pt-0.5">
                  <div>• <strong>Yellow Card Accumulation:</strong> Receiving {disciplinaryRules.yellow_card_limit} yellow cards results in an automatic 1-match suspension.</div>
                  <div>• <strong>Direct Red Card:</strong> Immediate expulsion + {disciplinaryRules.red_card_suspension_matches} matches suspension pending committee review.</div>
                </div>
              </div>

              {/* Active Suspensions & Ineligible Players */}
              <div className="mb-4 avoid-break">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase text-red-950 flex items-center space-x-1.5">
                    <span>⛔ Ineligible & Suspended Players ({suspendedPlayers.length})</span>
                  </span>
                  <span className="text-[8.5px] font-bold text-red-800 uppercase">Field Access Prohibited</span>
                </div>

                {suspendedPlayers.length === 0 ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-[9.5px] text-emerald-900 font-bold text-center">
                    ✓ NO ACTIVE SUSPENSIONS: All registered players across all 6 squads are cleared and eligible for match selection.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-[10px] border border-red-300">
                    <thead>
                      <tr className="bg-red-950 text-amber-200 text-[8.5px] font-black uppercase">
                        <th className="py-1.5 px-3">Player Name</th>
                        <th className="py-1.5 px-3">Club</th>
                        <th className="py-1.5 px-3">Violation Reason</th>
                        <th className="py-1.5 px-2 text-center w-24">Banned Fixtures</th>
                        <th className="py-1.5 px-3 text-center w-24">Tribunal Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-200">
                      {suspendedPlayers.map(p => {
                        const tName = teams.find(t => t.id === p.team_id)?.name || 'Squad';
                        return (
                          <tr key={p.id} className="bg-red-50/60">
                            <td className="py-1.5 px-3 font-extrabold text-red-950">{p.name}</td>
                            <td className="py-1.5 px-3 font-bold text-slate-700">{tName}</td>
                            <td className="py-1.5 px-3 text-red-900 font-medium">{p.suspension_reason || 'Disciplinary violation'}</td>
                            <td className="py-1.5 px-2 text-center font-black text-red-700">{p.suspension_matches_remaining || 1} match</td>
                            <td className="py-1.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-red-700 text-white font-black text-[8px] uppercase">
                                INELIGIBLE
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Complete Card Registry Table */}
              <div className="mb-3 avoid-break">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase text-slate-900">
                    Official Disciplinary Card Ledger ({disciplinedPlayers.length} Penalized Players)
                  </span>
                  <span className="text-[8.5px] font-bold text-slate-500">Sorted by Severity</span>
                </div>

                <table className="w-full text-left border-collapse text-[10px] border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[8.5px] font-black uppercase border-b border-slate-200">
                      <th className="py-1.5 px-3">Player Name</th>
                      <th className="py-1.5 px-3">Club</th>
                      <th className="py-1.5 px-2">Role</th>
                      <th className="py-1.5 px-2 text-center w-16">Yellows (🟨)</th>
                      <th className="py-1.5 px-2 text-center w-16">Reds (🟥)</th>
                      <th className="py-1.5 px-3 text-center w-24">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {disciplinedPlayers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-3 text-center text-slate-400 italic text-[9px]">
                          Clean Fair Play Record: No cards issued to date.
                        </td>
                      </tr>
                    ) : (
                      disciplinedPlayers.slice(0, 10).map(p => {
                        const tName = teams.find(t => t.id === p.team_id)?.name || 'Squad';
                        return (
                          <tr key={p.id}>
                            <td className="py-1 px-3 font-bold text-slate-900">{p.name}</td>
                            <td className="py-1 px-3 text-slate-700 font-semibold">{tName}</td>
                            <td className="py-1 px-2 text-slate-500">{p.role}</td>
                            <td className="py-1 px-2 text-center font-bold text-amber-700">{p.yellow_cards || 0}</td>
                            <td className="py-1 px-2 text-center font-bold text-red-700">{p.red_cards || 0}</td>
                            <td className="py-1 px-3 text-center">
                              {p.is_suspended ? (
                                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[8px] font-black uppercase">Suspended</span>
                              ) : (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[8px] font-black uppercase">Cleared</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Disciplinary Committee Chairman Seal */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-8 text-[9px] text-slate-500 avoid-break">
                <div>
                  <div className="border-b border-slate-300 pb-5 mb-1" />
                  <div className="font-bold uppercase tracking-wider text-slate-800">Disciplinary Tribunal Officer</div>
                  <div className="text-[8px] text-slate-400">Official Decision Ratified</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-5 mb-1" />
                  <div className="font-bold uppercase tracking-wider text-slate-800">Referee Advisory Board</div>
                  <div className="text-[8px] text-slate-400">Fair Play Sanctions Certified</div>
                </div>
              </div>

            </div>

            {/* Sheet Footer */}
            <OfficialSheetFooter sheetNumber="4" />
          </div>
        )}

        {/* ====================================================
            PAGE / SHEET 5: MATCH LINEUPS, EVENT TIMELINE & OFFICIAL CERTIFICATION SEAL
            ==================================================== */}
        {(selectedSheet === 'all' || selectedSheet === '5') && (
          <div className={`a4-paper-container flex flex-col justify-between ${viewMode === 'dense' ? 'max-w-none shadow-none border-none p-0 min-h-0' : ''}`}>
            
            <div>
              {/* Sheet Header */}
              <OfficialSheetHeader
                sheetNumber="5"
                sheetTitle="BULLETIN 05 · MATCHDAY LINEUPS, TIMELINE EVENTS & OFFICIAL CERTIFICATION"
                sheetSubtitle="Pitch Event Records, Strategic Formations, Ratification Statement & Authority Signatures"
              />

              {/* Match Lineups & Timeline Events Cards */}
              <div className="space-y-2.5 mb-4 avoid-break">
                <div className="text-[10px] font-black uppercase text-red-950 tracking-wider">
                  Featured Match Lineup & Event Logs
                </div>

                {matches.slice(0, 3).map((m, mIdx) => {
                  const h = teams.find(t => t.id === m.home_team_id)?.name || m.home_team?.name || 'Home';
                  const a = teams.find(t => t.id === m.away_team_id)?.name || m.away_team?.name || 'Away';
                  const isComp = m.status === 'Completed';

                  return (
                    <div key={m.id || mIdx} className="border border-slate-300 rounded p-2 bg-slate-50/50 space-y-1.5 avoid-break">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px]">
                        <div>
                          <span className="font-black text-slate-900">{h} vs {a}</span>
                          <span className="text-slate-500 ml-2 font-mono text-[9px]">{formatMatchTime(m.match_time)}</span>
                        </div>
                        <div className="font-mono font-black text-xs">
                          {isComp ? (
                            <span className="px-2 py-0.5 bg-red-950 text-amber-300 rounded">
                              {m.home_score} : {m.away_score} (FT)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">
                              Kickoff Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Event badges */}
                      {m.events && m.events.length > 0 ? (
                        <div className="flex flex-wrap gap-1 text-[9px]">
                          {m.events.map((evt, idx) => (
                            <span key={idx} className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-white border border-slate-200">
                              <span>{evt.type === 'goal' ? '⚽' : evt.type === 'red_card' ? '🟥' : '🟨'}</span>
                              <span className="font-bold text-slate-800">{evt.player_name}</span>
                              <span className="text-slate-400">{evt.minute}'</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[8.5px] text-slate-400 italic">
                          Official starting 7 squad lineups filed with 4th Official at Morning Turf.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Official Ratification Declaration & Circular Gold Tournament Seal */}
              <div className="p-3.5 bg-gradient-to-br from-red-950 via-red-900 to-amber-950 rounded-xl text-white border-2 border-amber-400/80 mb-4 avoid-break shadow-md">
                <div className="flex items-center space-x-4">
                  
                  {/* High-Resolution SVG Official Tournament Seal */}
                  <div className="w-20 h-20 flex-shrink-0 relative flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-amber-300 animate-spin-slow">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3,2" />
                      <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="50" cy="50" r="32" fill="#7f1d1d" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <Trophy className="w-5 h-5 text-amber-300 stroke-[2.2]" />
                      <span className="text-[6.5px] font-black tracking-widest text-amber-200 mt-0.5">SEAL 2026</span>
                      <span className="text-[5px] font-bold text-amber-400 tracking-tighter">OFFICIAL</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1 text-[8.5px] font-black uppercase tracking-widest text-amber-300">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Official Tournament Ratification & Governance Certification</span>
                    </div>
                    <p className="text-[9.5px] text-amber-100/90 leading-relaxed font-medium">
                      This technical document constitutes the complete and officially verified competitive record of the <strong>Morning Football Cup (Season 6)</strong>, conducted at Morning Turf, Pandallur, Kerala. All results, standings, player rosters, and disciplinary notices recorded herein are ratified by the Tournament Organizing Committee.
                    </p>
                    <div className="text-[8px] text-amber-300/80 font-mono pt-0.5">
                      SEAL ID: MFV-RATIFIED-2026-S6 · JURISDICTION: PANDALLUR, KERALA
                    </div>
                  </div>

                </div>
              </div>

              {/* 3 Authority Formal Sign-off Blocks */}
              <div className="grid grid-cols-3 gap-4 text-[9px] text-slate-600 avoid-break pt-1">
                <div className="p-2 border border-slate-300 rounded bg-slate-50">
                  <div className="border-b border-slate-400 pb-7 mb-1" />
                  <div className="font-extrabold uppercase text-slate-900 text-[8.5px]">Tournament Director</div>
                  <div className="text-[7.5px] text-slate-500">Morning Football Vibes Committee</div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50">
                  <div className="border-b border-slate-400 pb-7 mb-1" />
                  <div className="font-extrabold uppercase text-slate-900 text-[8.5px]">Chief Match Referee</div>
                  <div className="text-[7.5px] text-slate-500">Official Referee Commission</div>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-slate-50">
                  <div className="border-b border-slate-400 pb-7 mb-1" />
                  <div className="font-extrabold uppercase text-slate-900 text-[8.5px]">Venue Operations Head</div>
                  <div className="text-[7.5px] text-slate-500">Morning Turf Arena, Pandallur</div>
                </div>
              </div>

            </div>

            {/* Sheet Footer */}
            <OfficialSheetFooter sheetNumber="5" />
          </div>
        )}

      </div>

    </div>
  );
}
