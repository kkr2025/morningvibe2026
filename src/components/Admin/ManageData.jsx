import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  Database, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  FileCode,
  Copy,
  Check,
  ShieldAlert,
  Calendar,
  Users,
  Shield,
  FileJson
} from 'lucide-react';
import { 
  exportTournamentBackup, 
  restoreTournamentBackup, 
  deleteAllTournamentData, 
  resetDemoData, 
  isSupabaseConfigured 
} from '../../lib/supabase';

const SUPABASE_SQL_CODE = `-- ========================================================
-- MORNING FOOTBALL VIBES: THE MORNING CUP (SEASON 6)
-- Complete Supabase PostgreSQL Schema & Wipe Commands
-- ========================================================

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Players Table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Forward', 'Midfielder', 'Center Back', 'Goalkeeper', 'Coach')),
  goals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  match_time TIMESTAMPTZ NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read All Teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update/Delete Teams" ON public.teams FOR ALL USING (true);

CREATE POLICY "Public Read All Players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update/Delete Players" ON public.players FOR ALL USING (true);

CREATE POLICY "Public Read All Matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update/Delete Matches" ON public.matches FOR ALL USING (true);

-- ========================================================
-- ADMIN COMMANDS (Optional SQL to Wipe or Reset Data)
-- ========================================================

-- COMMAND A: Clear all matches & reset points table to zero
-- TRUNCATE TABLE public.matches;
-- UPDATE public.teams SET matches_played=0, wins=0, draws=0, losses=0, goals_for=0, goals_against=0, points=0;
-- UPDATE public.players SET goals=0;

-- COMMAND B: Complete Database Factory Reset (Delete Everything)
-- TRUNCATE TABLE public.matches CASCADE;
-- TRUNCATE TABLE public.players CASCADE;
-- TRUNCATE TABLE public.teams CASCADE;
`;

export default function ManageData({ matches = [], players = [], teams = [], onDataRefreshed }) {
  const [message, setMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restorePreview, setRestorePreview] = useState(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
  // Danger Zone confirmation states
  const [wipeMode, setWipeMode] = useState(null); // 'matches' | 'cards' | 'factory' | 'demo'
  const [confirmInput, setConfirmInput] = useState('');

  const fileInputRef = useRef(null);

  // 1. Export Backup
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportTournamentBackup();
      setMessage({
        type: 'success',
        text: `Backup exported successfully! Contains ${data.stats.teamsCount} squads, ${data.stats.playersCount} players, and ${data.stats.matchesCount} fixtures.`
      });
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to export backup: ${err.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Select File for Restore
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const data = parsed.data || parsed;
        if (!data || (!data.teams && !data.matches)) {
          throw new Error('Unrecognized file structure: missing teams or matches array.');
        }

        setRestorePreview({
          parsed,
          fileName: file.name,
          teamsCount: Array.isArray(data.teams) ? data.teams.length : 0,
          playersCount: Array.isArray(data.players) ? data.players.length : 0,
          matchesCount: Array.isArray(data.matches) ? data.matches.length : 0,
          exportDate: parsed.exportTimestamp || 'Unknown',
        });
        setMessage(null);
      } catch (err) {
        setMessage({ type: 'error', text: `Invalid backup JSON file: ${err.message}` });
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  // 3. Confirm and Execute Restore
  const handleConfirmRestore = async () => {
    if (!restorePreview || !restorePreview.parsed) return;
    try {
      setIsRestoring(true);
      const result = await restoreTournamentBackup(restorePreview.parsed);
      setMessage({
        type: 'success',
        text: `Tournament successfully restored! Restored ${result.restored.teams} squads, ${result.restored.players} players, and ${result.restored.matches} matches.`
      });
      setRestorePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      setMessage({ type: 'error', text: `Restore failed: ${err.message}` });
    } finally {
      setIsRestoring(false);
    }
  };

  // 4. Danger Zone Deletions
  const handleExecuteWipe = async () => {
    try {
      if (wipeMode === 'matches') {
        const res = await deleteAllTournamentData('matches_only');
        setMessage({ type: 'success', text: res.message });
      } else if (wipeMode === 'cards') {
        const res = await deleteAllTournamentData('cards_only');
        setMessage({ type: 'success', text: res.message });
      } else if (wipeMode === 'factory') {
        if (confirmInput.trim().toUpperCase() !== 'DELETE') {
          setMessage({ type: 'error', text: 'You must type "DELETE" exactly to confirm factory reset.' });
          return;
        }
        const res = await deleteAllTournamentData('all');
        setMessage({ type: 'success', text: res.message });
      } else if (wipeMode === 'demo') {
        resetDemoData();
        setMessage({
          type: 'success',
          text: 'Tournament reset to default 6-squad demo schedule and rosters.'
        });
      }

      setWipeMode(null);
      setConfirmInput('');
      if (onDataRefreshed) onDataRefreshed();
    } catch (err) {
      setMessage({ type: 'error', text: `Operation failed: ${err.message}` });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Database className="w-6 h-6 stroke-[2.2] text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Backup, Restore & Data Controls
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-100 text-emerald-800 border-emerald-300">
                  Live Cloud Database
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Download portable JSON backups, restore historical tournaments, or wipe match records cleanly.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto border border-slate-300"
          >
            <FileCode className="w-4 h-4 text-red-600" />
            <span>Database SQL Setup</span>
          </button>
        </div>

        {/* Global Feedback Alert */}
        {message && (
          <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm font-semibold shadow-sm animate-fade-in-up ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
            <span className="flex-1">{message.text}</span>
            <button 
              onClick={() => setMessage(null)} 
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Database Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div className="text-2xl font-black text-red-700 font-display">{teams.length}</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Active Squads</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div className="text-2xl font-black text-slate-800 font-display">{players.length}</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Registered Players</div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div className="text-2xl font-black text-amber-600 font-display">{matches.length}</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">
              Fixtures ({matches.filter(m => m.status === 'Completed').length} FT)
            </div>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
            <div className="text-2xl font-black text-emerald-600 font-display">Season 6</div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Tournament Cup</div>
          </div>
        </div>

      </div>

      {/* Two Column Section: Backup & Restore */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: BACKUP DOWNLOAD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Download className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base font-display">
                  Download Full Backup
                </h4>
                <p className="text-xs text-slate-500">
                  Export all tournament data to a portable JSON file.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Downloads a timestamped <code className="bg-slate-100 text-red-700 px-1 py-0.5 rounded font-mono">.json</code> file containing:
            </p>

            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 font-medium">
              <li>All 6 teams with points, wins, draws, losses, goals for/against.</li>
              <li>Complete player rosters and roles.</li>
              <li>All scheduled and completed matches with final scores.</li>
              <li>Matchday lineups, goal scorers, yellow cards 🟨, and red cards 🟥.</li>
              <li>Disciplinary thresholds & suspension settings.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating Backup...' : 'Export & Download Backup JSON'}</span>
            </button>
          </div>
        </div>

        {/* CARD 2: RESTORE BACKUP */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base font-display">
                  Restore from Backup File
                </h4>
                <p className="text-xs text-slate-500">
                  Upload an exported JSON backup to restore entire tournament state.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Select any previously exported Morning Cup JSON backup. The system validates all data before applying changes.
            </p>

            {/* File Selector */}
            <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            {/* Restore Preview Info */}
            {restorePreview && (
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5 animate-fade-in-up">
                <div className="font-bold text-blue-950 flex items-center justify-between">
                  <span>File: {restorePreview.fileName}</span>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Valid Backup</span>
                </div>
                <div className="text-blue-900 text-[11px] grid grid-cols-3 gap-1 pt-1 font-semibold">
                  <div>• {restorePreview.teamsCount} Teams</div>
                  <div>• {restorePreview.playersCount} Players</div>
                  <div>• {restorePreview.matchesCount} Matches</div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleConfirmRestore}
              disabled={!restorePreview || isRestoring}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>{isRestoring ? 'Restoring Database...' : 'Confirm & Restore Tournament'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* CARD 3: DANGER ZONE (DELETE ALL DATA & RESETS) */}
      <div className="bg-white rounded-3xl p-6 border-2 border-red-200 shadow-xl space-y-5">
        
        <div className="flex items-center space-x-2.5 pb-4 border-b border-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-extrabold text-red-950 text-base sm:text-lg font-display">
              Danger Zone: Wipe & Reset Options
            </h4>
            <p className="text-xs text-red-700/80">
              Clear matches, reset standings, erase disciplinary cards, or factory wipe all records.
            </p>
          </div>
        </div>

        {/* Wipe Confirmation Modal / Drawer */}
        {wipeMode && (
          <div className="p-5 rounded-2xl bg-red-950 text-white border-2 border-red-500 space-y-3 shadow-2xl animate-fade-in-up">
            <div className="flex items-center space-x-2 text-amber-400 font-black text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>
                {wipeMode === 'matches' && 'Confirm: Clear All Matches & Reset Standings'}
                {wipeMode === 'cards' && 'Confirm: Clear All Yellow/Red Cards & Bans'}
                {wipeMode === 'demo' && 'Confirm: Reset to Default 6-Squad Demo Data'}
                {wipeMode === 'factory' && 'DANGER: Complete Tournament Factory Wipe'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {wipeMode === 'matches' && 'This will delete all scheduled and completed match fixtures, set team points table to 0 (P/W/D/L/GF/GA), and clear player goals. Team rosters remain intact.'}
              {wipeMode === 'cards' && 'This will reset all accumulated yellow and red cards back to 0 and remove all active player suspensions.'}
              {wipeMode === 'demo' && 'This will overwrite current squads and fixtures with the pristine 6-squad demo tournament data.'}
              {wipeMode === 'factory' && 'This will permanently DELETE all teams, players, matches, lineups, and cards from both Supabase and local storage!'}
            </p>

            {wipeMode === 'factory' && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-amber-300">
                  Type <span className="font-mono text-white underline">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-red-500 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleExecuteWipe}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg transition-all active:scale-95"
              >
                Execute Action
              </button>
              <button
                onClick={() => {
                  setWipeMode(null);
                  setConfirmInput('');
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Action 1: Clear Matches */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-black text-amber-950 text-xs sm:text-sm">Clear Matches Only</div>
              <p className="text-[11px] text-amber-800/90 mt-1 leading-relaxed">
                Deletes all fixtures, resets Points Table & goals to 0, keeping team rosters.
              </p>
            </div>
            <button
              onClick={() => setWipeMode('matches')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Reset Matches
            </button>
          </div>

          {/* Action 2: Clear Cards & Bans */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-black text-amber-950 text-xs sm:text-sm">Clear Cards & Bans</div>
              <p className="text-[11px] text-amber-800/90 mt-1 leading-relaxed">
                Resets all yellow/red card records and lifts all active suspensions.
              </p>
            </div>
            <button
              onClick={() => setWipeMode('cards')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Clear Cards
            </button>
          </div>

          {/* Action 3: Restore 6-Team Demo */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-black text-slate-800 text-xs sm:text-sm">Reset to Demo State</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Replaces current database with the pristine 6 default teams and schedule.
              </p>
            </div>
            <button
              onClick={() => setWipeMode('demo')}
              className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Reset Demo
            </button>
          </div>

          {/* Action 4: Complete Factory Wipe */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-black text-rose-950 text-xs sm:text-sm">Delete All Data</div>
              <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                Permanently wipes all teams, players, matches, lineups, and records.
              </p>
            </div>
            <button
              onClick={() => setWipeMode('factory')}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
          </div>

        </div>

      </div>

      {/* Supabase SQL Code Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base sm:text-lg font-display">
                  Supabase PostgreSQL Schema & Wipe Code
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs text-amber-200 bg-slate-950/80 leading-relaxed selection:bg-amber-400 selection:text-red-950">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_CODE}</pre>
            </div>

            <div className="p-4 bg-slate-850 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Paste this in your Supabase project's SQL Editor to set up or manage tables.</span>
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
