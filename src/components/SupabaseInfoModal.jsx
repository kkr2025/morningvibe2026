import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Code2
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export default function SupabaseInfoModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleEnv = `# In your .env file:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...your-anon-key-here
VITE_ADMIN_PASSWORD=morningvibes2026`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isSupabaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Supabase Database Status
            </h3>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="text-xs font-semibold text-slate-600">
                {isSupabaseConfigured ? 'Connected to live Supabase project' : 'Running in Offline / Local Demo Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-600">
          <p className="leading-relaxed">
            The application is equipped with dual-engine persistence: it seamlessly connects to live <strong>Supabase</strong> when configured in <code>.env</code>, and provides a full offline/demo experience with automatic local caching.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Database Schema Overview:</span>
              <span className="text-[11px] text-emerald-700 font-mono">supabase-schema.sql</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li><strong>teams:</strong> id, name, matches_played, wins, draws, losses, goals_for, goals_against, points</li>
              <li><strong>players:</strong> id, team_id (FK), name, role (Forward, Midfielder, Center Back, Goalkeeper, Coach), goals</li>
              <li><strong>matches:</strong> id, home_team_id (FK), away_team_id (FK), match_time, home_score, away_score, status (Scheduled, Completed)</li>
              <li><strong>Trigger Logic:</strong> Automated standings & goal tally updates on match completion!</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Connecting Your Live Supabase Project:
              </span>
              <button
                onClick={handleCopyEnv}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy .env snippet'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              {sampleEnv}
            </pre>
            <p className="text-[11px] text-slate-400 mt-1.5">
              1. Run the SQL script from <code>supabase-schema.sql</code> in your Supabase SQL Editor.<br/>
              2. Paste your project URL & Anon key into <code>.env</code> and restart Vite.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
