# ⚽ Morning Football Vibes: The Morning Cup

A modern, responsive, mobile-first web application designed for managing and tracking a 6-team football tournament. Built with **React (Vite)**, **Tailwind CSS**, **Supabase**, and **Lucide React**.

---

## 🌟 Key Features

### 1. 🏆 Public Portal (View Only)
- **Morning Turf Hero Banner**: High-energy morning football aesthetic with tournament stats (Active Squads, Matches Played, Goals Scored, Golden Boot leader).
- **Points Table (Standings)**: Standard football league table ranked by:
  1. Points (Win = 3, Draw = 1, Loss = 0)
  2. Goal Difference ($GD = GF - GA$)
  3. Goals For ($GF$)
- **Match Center**: Filter between **All Matches**, **Scheduled (Upcoming)**, and **Completed (Results)** with kickoff times and scoreboards.
- **Top Scorers (Golden Boot)**: Podium cards for Top 3, player roles, team associations, and goal counts with position filtering.
- **Teams & Squads**: Roster breakdown for all 6 squads with player positions and designated Head Coaches.

### 2. 🔐 Protected Admin Dashboard
- **Admin Authentication**: Protected by an admin passcode (Default: `morningvibes2026`).
- **Add Team Form**: Register new squads with custom badge icons and theme colors.
- **Add Player Form**: Assign squad members with standard roles:
  - `Forward`, `Midfielder`, `Center Back`, `Goalkeeper`, `Coach`
- **Schedule Match Form**: Pick Home & Away teams with validation preventing self-matches, and `<input type="datetime-local">` with morning quick-presets.
- **Update Score / Complete Match**:
  - Enter Home Score and Away Score.
  - Optional goal credit attribution to players.
  - **Automated Trigger Logic**: Upon clicking **"Complete Match"**, the application automatically:
    - Increments `matches_played` for both teams.
    - Evaluates Win, Draw, or Loss.
    - Allocates 3 points to the winner, 1 point to each for a draw, 0 for a loss.
    - Updates `goals_for` and `goals_against` for both teams.
    - Updates match status to `Completed`.
    - Triggers celebratory confetti!

### 3. ⚡ Dual-Engine Data Layer (Supabase + Local Demo)
- **Supabase Integration**: Direct integration with PostgreSQL on Supabase via `@supabase/supabase-js`.
- **Instant Demo Mode**: If Supabase credentials are not yet entered, the app runs smoothly in offline/demo mode with persistent local storage.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Connect Live Supabase Database
1. Create a free project at [database.new](https://database.new) (Supabase).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase-schema.sql` from this repository, paste the entire SQL code, and click **Run**.
4. In your Supabase dashboard, navigate to **Project Settings > API**.
5. Copy your **Project URL** and **anon public key**.
6. Create or update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=morningvibes2026
```
7. Restart the Vite server (`npm run dev`). The status indicator in the top navbar will now display **"Supabase Live"**!

---

## 📁 File Structure

```
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── index.html                # HTML entry point with fonts & metadata
├── package.json              # Project dependencies and build scripts
├── postcss.config.js         # PostCSS configuration for Tailwind
├── tailwind.config.js        # Custom green turf & morning gold theme
├── supabase-schema.sql       # Complete SQL tables, constraints, trigger/RPC & seed data
├── src/
│   ├── main.jsx              # React DOM mounting
│   ├── index.css             # Tailwind base & custom pitch CSS
│   ├── App.jsx               # Main controller with routing & state
│   ├── lib/
│   │   ├── supabase.js       # Supabase client & dual-mode service layer
│   │   ├── mockData.js       # 6 initial teams, rosters, and match data
│   │   └── utils.js          # Date formatters, confetti, and role badge styles
│   └── components/
│       ├── Navbar.jsx        # Navigation header & Supabase connection indicator
│       ├── Hero.jsx          # Tournament hero banner with live counters
│       ├── StandingsTable.jsx # Football league table with tiebreaker sorting
│       ├── MatchCenter.jsx   # Fixtures and scoreboard results
│       ├── TopScorers.jsx    # Golden boot leaderboard & podium
│       ├── TeamsList.jsx     # Team squad rosters & coaches
│       ├── SupabaseInfoModal.jsx # Setup help modal with 1-click copy
│       └── Admin/
│           ├── AdminLoginModal.jsx     # Passcode gate
│           ├── AdminDashboard.jsx      # Admin command center
│           ├── AddTeamForm.jsx         # Create squad
│           ├── AddPlayerForm.jsx       # Register player / coach
│           ├── ScheduleMatchForm.jsx   # Match fixture scheduler
│           ├── UpdateMatchScoreForm.jsx # Score entry & automated trigger logic
│           ├── ManageMatches.jsx       # All-in-one match lifecycle manager
│           ├── ManageTeams.jsx         # Team CRUD & squad roster manager
│           ├── DisciplinarySettings.jsx # Card thresholds & bans governance
│           ├── TournamentBook.jsx      # Pro-level A4 PDF Technical Dossier
│           └── ManageData.jsx          # Reset tournament & maintenance
```

---

## 🚀 Deploy to Vercel (1-Click Ready)

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/kkr2025/morningvibe2026.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/) and click **"Add New Project"**.
3. Import your **`morningvibe2026`** repository.
4. Framework Preset: **Vite** (auto-detected).
5. Add the following **Environment Variables** in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase URL (e.g. `https://your-project.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key
   - `VITE_ADMIN_PASSWORD`: Your admin passcode (e.g. `morningvibes2026`)
6. Click **Deploy**! Your site is live with global CDN, SSL, and instant continuous deployment on every Git push.

---

## 🔑 Default Admin Password
- Default: `morningvibes2026`
- Can be changed anytime via `VITE_ADMIN_PASSWORD` in your `.env` or Vercel Environment Variables.

---

### ✨ A LUGH LAB CREATION · COPYRIGHT © 2026
Crafted for Grassroots Football Excellence · Morning Football Vibes · Pandallur, Kerala.
