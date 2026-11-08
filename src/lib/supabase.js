import { createClient } from '@supabase/supabase-js';
import { INITIAL_TEAMS, INITIAL_PLAYERS, INITIAL_MATCHES } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage keys for offline/demo fallback
const STORAGE_KEYS = {
  TEAMS: 'mfv_teams_data',
  PLAYERS: 'mfv_players_data',
  MATCHES: 'mfv_matches_data',
  CONFIG_OVERRIDE: 'mfv_custom_creds',
};

// Initialize LocalStorage if empty
function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
  }
}

initLocalStorage();

// ==============================================================================
// SERVICE API (Works seamlessly with Supabase or Local Storage)
// ==============================================================================

/**
 * Fetch all teams sorted by Points (desc), Goal Difference (desc), Goals For (desc)
 */
export async function getTeams() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      
      if (error) throw error;

      // Merge locally-cached logo, color, badge for teams (stored when uploading logo)
      let logoCache = {};
      try { logoCache = JSON.parse(localStorage.getItem('mfv_logos') || '{}'); } catch (_) {}

      // Sort client-side to guarantee standard tiebreakers
      return (data || []).map(t => ({
        ...t,
        ...(logoCache[t.id] || {}),
      })).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = (a.goals_for || 0) - (a.goals_against || 0);
        const gdB = (b.goals_for || 0) - (b.goals_against || 0);
        if (gdB !== gdA) return gdB - gdA;
        return (b.goals_for || 0) - (a.goals_for || 0);
      });
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local data:', err);
    }
  }

  // Local storage fallback
  const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
  const teams = raw ? JSON.parse(raw) : INITIAL_TEAMS;
  return teams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = (a.goals_for || 0) - (a.goals_against || 0);
    const gdB = (b.goals_for || 0) - (b.goals_against || 0);
    if (gdB !== gdA) return gdB - gdA;
    return (b.goals_for || 0) - (a.goals_for || 0);
  });
}

/**
 * Fetch all players with team details
 */
export async function getPlayers() {
  let playersList = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*, team:teams(id, name)');
      
      if (error) throw error;
      playersList = data || [];
    } catch (err) {
      console.warn('Supabase players fetch failed, falling back to local data:', err);
    }
  }

  if (playersList.length === 0) {
    const rawPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    const rawTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    const players = rawPlayers ? JSON.parse(rawPlayers) : INITIAL_PLAYERS;
    const teams = rawTeams ? JSON.parse(rawTeams) : INITIAL_TEAMS;

    const teamMap = new Map(teams.map(t => [t.id, t]));
    playersList = players.map(p => ({
      ...p,
      team: teamMap.get(p.team_id) || { name: 'Unknown Team' }
    }));
  }

  // Merge locally stored cards and suspension states
  let disciplineCache = {};
  try {
    disciplineCache = JSON.parse(localStorage.getItem('mfv_player_discipline') || '{}');
  } catch (_) {}

  const enriched = playersList.map(p => {
    const disc = disciplineCache[p.id] || {};
    return {
      ...p,
      yellow_cards: disc.yellow_cards !== undefined ? disc.yellow_cards : (p.yellow_cards || 0),
      red_cards: disc.red_cards !== undefined ? disc.red_cards : (p.red_cards || 0),
      is_suspended: disc.is_suspended !== undefined ? disc.is_suspended : Boolean(p.is_suspended),
      suspension_matches_remaining: disc.suspension_matches_remaining || 0,
      suspension_reason: disc.suspension_reason || '',
    };
  });

  return enriched.sort((a, b) => (b.goals || 0) - (a.goals || 0));
}

/**
 * Fetch all matches with home and away team details, events and lineups
 */
export async function getMatches() {
  let matchesList = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name),
          away_team:teams!away_team_id(id, name)
        `)
        .order('match_time', { ascending: true });

      if (error) throw error;
      matchesList = data || [];
    } catch (err) {
      console.warn('Supabase matches fetch with join failed, trying plain fetch:', err);
      try {
        const { data: rawMatches } = await supabase.from('matches').select('*').order('match_time');
        const { data: teams } = await supabase.from('teams').select('id, name');
        const teamMap = new Map((teams || []).map(t => [t.id, t]));
        matchesList = (rawMatches || []).map(m => ({
          ...m,
          home_team: teamMap.get(m.home_team_id) || { name: 'Home Team' },
          away_team: teamMap.get(m.away_team_id) || { name: 'Away Team' },
        }));
      } catch (innerErr) {
        console.warn('Supabase match fallback failed:', innerErr);
      }
    }
  }

  if (matchesList.length === 0) {
    const rawMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
    const rawTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    const matches = rawMatches ? JSON.parse(rawMatches) : INITIAL_MATCHES;
    const teams = rawTeams ? JSON.parse(rawTeams) : INITIAL_TEAMS;

    const teamMap = new Map(teams.map(t => [t.id, t]));
    matchesList = matches.map(m => ({
      ...m,
      home_team: teamMap.get(m.home_team_id) || { name: 'Home Team' },
      away_team: teamMap.get(m.away_team_id) || { name: 'Away Team' }
    }));
  }

  // Merge match events and lineups from cache
  let matchDetailsCache = {};
  try {
    matchDetailsCache = JSON.parse(localStorage.getItem('mfv_match_details') || '{}');
  } catch (_) {}

  return matchesList.map(m => {
    const details = matchDetailsCache[m.id] || {};
    return {
      ...m,
      events: details.events || m.events || [],
      lineups: details.lineups || m.lineups || { home_starting: [], away_starting: [] },
    };
  }).sort((a, b) => new Date(a.match_time) - new Date(b.match_time));
}

/**
 * Add a new team
 */
export async function addTeam({ name, color, badge, logo = null }) {
  if (!name || !name.trim()) throw new Error('Team name is required.');

  if (isSupabaseConfigured && supabase) {
    // Try inserting with logo column; if column doesn't exist, fall through gracefully
    const insertObj = {
      name: name.trim(),
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    };
    // Only include logo if it exists (column may not exist in older schema)
    if (logo) {
      try {
        const { data: withLogo, error: errWithLogo } = await supabase
          .from('teams')
          .insert([{ ...insertObj, logo }])
          .select()
          .single();
        if (!errWithLogo) return { ...withLogo, color: color || '#16a34a', badge: badge || '⚽' };
      } catch (_) { /* fall through to insert without logo */ }
    }
    const { data, error } = await supabase
      .from('teams')
      .insert([insertObj])
      .select()
      .single();
    if (error) throw error;
    // Store logo in localStorage as supplement (since column may not exist in Supabase yet)
    if (logo) {
      try {
        const cached = JSON.parse(localStorage.getItem('mfv_logos') || '{}');
        cached[data.id] = { logo, color, badge };
        localStorage.setItem('mfv_logos', JSON.stringify(cached));
      } catch (_) {}
    }
    return { ...data, logo: logo || null, color: color || '#16a34a', badge: badge || '⚽' };
  }

  // Local Storage
  const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
  const teams = raw ? JSON.parse(raw) : INITIAL_TEAMS;

  if (teams.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
    throw new Error('A team with this name already exists.');
  }

  const newTeam = {
    id: `team-${Date.now()}`,
    name: name.trim(),
    matches_played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0,
    color: color || '#16a34a',
    badge: badge || '⚽',
    logo: logo || null,
    created_at: new Date().toISOString()
  };

  teams.push(newTeam);
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  return newTeam;
}

/**
 * Update an existing team (name, color, badge, logo, stats)
 */
export async function updateTeam(id, updateData) {
  if (!id) throw new Error('Team ID is required to update.');

  const { name, color, badge, logo, matches_played, wins, draws, losses, goals_for, goals_against, points } = updateData;

  // Cache logo/color/badge locally for fast persistence & fallback
  try {
    const cached = JSON.parse(localStorage.getItem('mfv_logos') || '{}');
    cached[id] = {
      ...(cached[id] || {}),
      ...(color ? { color } : {}),
      ...(badge ? { badge } : {}),
      ...(logo !== undefined ? { logo } : {}),
    };
    localStorage.setItem('mfv_logos', JSON.stringify(cached));
  } catch (_) {}

  if (isSupabaseConfigured && supabase) {
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (matches_played !== undefined) updatePayload.matches_played = Number(matches_played);
    if (wins !== undefined) updatePayload.wins = Number(wins);
    if (draws !== undefined) updatePayload.draws = Number(draws);
    if (losses !== undefined) updatePayload.losses = Number(losses);
    if (goals_for !== undefined) updatePayload.goals_for = Number(goals_for);
    if (goals_against !== undefined) updatePayload.goals_against = Number(goals_against);
    if (points !== undefined) updatePayload.points = Number(points);

    // Try updating with logo if provided
    if (logo !== undefined) {
      try {
        const { data: withLogoData, error: errLogo } = await supabase
          .from('teams')
          .update({ ...updatePayload, logo })
          .eq('id', id)
          .select()
          .single();
        if (!errLogo) {
          return { ...withLogoData, color, badge, logo };
        }
      } catch (_) {}
    }

    // Fallback: update without logo column
    const { data, error } = await supabase
      .from('teams')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { ...data, color, badge, logo };
  }

  // Local Storage path
  const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
  const teams = raw ? JSON.parse(raw) : INITIAL_TEAMS;
  const index = teams.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Team not found in local records.');

  teams[index] = {
    ...teams[index],
    ...(name !== undefined ? { name: name.trim() } : {}),
    ...(color !== undefined ? { color } : {}),
    ...(badge !== undefined ? { badge } : {}),
    ...(logo !== undefined ? { logo } : {}),
    ...(matches_played !== undefined ? { matches_played: Number(matches_played) } : {}),
    ...(wins !== undefined ? { wins: Number(wins) } : {}),
    ...(draws !== undefined ? { draws: Number(draws) } : {}),
    ...(losses !== undefined ? { losses: Number(losses) } : {}),
    ...(goals_for !== undefined ? { goals_for: Number(goals_for) } : {}),
    ...(goals_against !== undefined ? { goals_against: Number(goals_against) } : {}),
    ...(points !== undefined ? { points: Number(points) } : {}),
  };

  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  return teams[index];
}

/**
 * Delete a team and its associated dependencies
 */
export async function deleteTeam(id) {
  if (!id) throw new Error('Team ID is required to delete.');

  // Clean local logo cache
  try {
    const cached = JSON.parse(localStorage.getItem('mfv_logos') || '{}');
    delete cached[id];
    localStorage.setItem('mfv_logos', JSON.stringify(cached));
  } catch (_) {}

  if (isSupabaseConfigured && supabase) {
    // Delete matches where this team participated first to avoid FK constraint violations
    try {
      await supabase.from('matches').delete().or(`home_team_id.eq.${id},away_team_id.eq.${id}`);
    } catch (err) {
      console.warn('Could not cascade delete matches:', err);
    }

    // Delete players belonging to this team
    try {
      await supabase.from('players').delete().eq('team_id', id);
    } catch (err) {
      console.warn('Could not cascade delete players:', err);
    }

    // Delete the team itself
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Local storage path
  const rawTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
  let teams = rawTeams ? JSON.parse(rawTeams) : INITIAL_TEAMS;
  teams = teams.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));

  // Remove players
  const rawPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  let players = rawPlayers ? JSON.parse(rawPlayers) : INITIAL_PLAYERS;
  players = players.filter(p => p.team_id !== id);
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

  // Remove matches
  const rawMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
  let matches = rawMatches ? JSON.parse(rawMatches) : INITIAL_MATCHES;
  matches = matches.filter(m => m.home_team_id !== id && m.away_team_id !== id);
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));

  return true;
}

/**
 * Add a new player
 */
export async function addPlayer({ team_id, name, role, goals = 0 }) {
  if (!team_id) throw new Error('Please select a team.');
  if (!name || !name.trim()) throw new Error('Player name is required.');
  if (!role) throw new Error('Please select a role.');

  const validRoles = ['Forward', 'Midfielder', 'Center Back', 'Goalkeeper', 'Coach'];
  if (!validRoles.includes(role)) {
    throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('players')
      .insert([{
        team_id,
        name: name.trim(),
        role,
        goals: Number(goals) || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local storage
  const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const players = raw ? JSON.parse(raw) : INITIAL_PLAYERS;

  const newPlayer = {
    id: `p-${Date.now()}`,
    team_id,
    name: name.trim(),
    role,
    goals: Number(goals) || 0,
    created_at: new Date().toISOString()
  };

  players.push(newPlayer);
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  return newPlayer;
}

/**
 * Schedule a match
 */
export async function scheduleMatch({ home_team_id, away_team_id, match_time }) {
  if (!home_team_id || !away_team_id) {
    throw new Error('Please select both Home and Away teams.');
  }
  if (home_team_id === away_team_id) {
    throw new Error('A team cannot play against itself.');
  }
  if (!match_time) {
    throw new Error('Please select match date and time.');
  }

  const isoTime = new Date(match_time).toISOString();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('matches')
      .insert([{
        home_team_id,
        away_team_id,
        match_time: isoTime,
        status: 'Scheduled',
        home_score: null,
        away_score: null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local storage
  const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
  const matches = raw ? JSON.parse(raw) : INITIAL_MATCHES;

  const newMatch = {
    id: `m-${Date.now()}`,
    home_team_id,
    away_team_id,
    match_time: isoTime,
    home_score: null,
    away_score: null,
    status: 'Scheduled',
    created_at: new Date().toISOString()
  };

  matches.push(newMatch);
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  return newMatch;
}

/**
 * Update an existing match (reschedule date/time, change teams, update score/status)
 */
export async function updateMatch(matchId, updateData) {
  if (!matchId) throw new Error('Match ID is required to update.');

  const payload = {};
  if (updateData.home_team_id) payload.home_team_id = updateData.home_team_id;
  if (updateData.away_team_id) payload.away_team_id = updateData.away_team_id;
  if (updateData.match_time) payload.match_time = new Date(updateData.match_time).toISOString();
  if (updateData.status) payload.status = updateData.status;
  if (updateData.home_score !== undefined) {
    payload.home_score = updateData.home_score === null ? null : parseInt(updateData.home_score, 10);
  }
  if (updateData.away_score !== undefined) {
    payload.away_score = updateData.away_score === null ? null : parseInt(updateData.away_score, 10);
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('matches')
      .update(payload)
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local storage path
  const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
  const matches = raw ? JSON.parse(raw) : INITIAL_MATCHES;
  const index = matches.findIndex(m => m.id === matchId);
  if (index === -1) throw new Error('Match not found.');

  matches[index] = {
    ...matches[index],
    ...payload,
  };

  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  return matches[index];
}

/**
 * Bulk schedule multiple matches at once (Fast round-robin or batch entry)
 */
export async function bulkScheduleMatches(fixturesList) {
  if (!Array.isArray(fixturesList) || fixturesList.length === 0) {
    throw new Error('Please provide at least one match to schedule.');
  }

  const formattedFixtures = fixturesList.map((f, i) => ({
    home_team_id: f.home_team_id,
    away_team_id: f.away_team_id,
    match_time: new Date(f.match_time).toISOString(),
    status: 'Scheduled',
    home_score: null,
    away_score: null,
  }));

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('matches')
      .insert(formattedFixtures)
      .select();

    if (error) throw error;
    return data;
  }

  // Local storage path
  const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
  const matches = raw ? JSON.parse(raw) : INITIAL_MATCHES;

  const newRecords = formattedFixtures.map((f, i) => ({
    ...f,
    id: `m-${Date.now()}-${i}`,
    created_at: new Date().toISOString()
  }));

  matches.push(...newRecords);
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  return newRecords;
}

/**
 * TRIGGER LOGIC: Complete Match & Auto-update Teams Standings
 * When "Complete Match" is clicked:
 * - Update match status to 'Completed' and record scores
 * - Home team: +1 matches_played, +home_score goals_for, +away_score goals_against
 * - Away team: +1 matches_played, +away_score goals_for, +home_score goals_against
 * - If home_score > away_score: Home +1 win, +3 pts; Away +1 loss, +0 pts
 * - If away_score > home_score: Away +1 win, +3 pts; Home +1 loss, +0 pts
 * - If draw: Both +1 draw, +1 pt each
 * - Optionally credit goal scorers to players table
 */
export async function completeMatchResult({ matchId, homeScore, awayScore, playerScorers = [], events = [], lineups = null }) {
  const hScore = parseInt(homeScore, 10);
  const aScore = parseInt(awayScore, 10);

  if (isNaN(hScore) || isNaN(aScore) || hScore < 0 || aScore < 0) {
    throw new Error('Please enter valid, non-negative scores for both teams.');
  }

  // 1. SUPABASE PATH
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: match, error: matchFetchErr } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchFetchErr) throw matchFetchErr;
      if (match.status === 'Completed') throw new Error('Match is already completed.');

      const { data: homeTeam } = await supabase.from('teams').select('*').eq('id', match.home_team_id).single();
      const { data: awayTeam } = await supabase.from('teams').select('*').eq('id', match.away_team_id).single();

      const homeWin = hScore > aScore ? 1 : 0;
      const awayWin = aScore > hScore ? 1 : 0;
      const draw = hScore === aScore ? 1 : 0;
      const homePts = homeWin * 3 + draw * 1;
      const awayPts = awayWin * 3 + draw * 1;

      // Update match status
      await supabase.from('matches').update({
        home_score: hScore,
        away_score: aScore,
        status: 'Completed'
      }).eq('id', matchId);

      // Update home team
      await supabase.from('teams').update({
        matches_played: (homeTeam.matches_played || 0) + 1,
        wins: (homeTeam.wins || 0) + homeWin,
        draws: (homeTeam.draws || 0) + draw,
        losses: (homeTeam.losses || 0) + (awayWin ? 1 : 0),
        goals_for: (homeTeam.goals_for || 0) + hScore,
        goals_against: (homeTeam.goals_against || 0) + aScore,
        points: (homeTeam.points || 0) + homePts
      }).eq('id', homeTeam.id);

      // Update away team
      await supabase.from('teams').update({
        matches_played: (awayTeam.matches_played || 0) + 1,
        wins: (awayTeam.wins || 0) + awayWin,
        draws: (awayTeam.draws || 0) + draw,
        losses: (awayTeam.losses || 0) + (homeWin ? 1 : 0),
        goals_for: (awayTeam.goals_for || 0) + aScore,
        goals_against: (awayTeam.goals_against || 0) + hScore,
        points: (awayTeam.points || 0) + awayPts
      }).eq('id', awayTeam.id);

      // Update individual player goals if provided
      if (playerScorers && playerScorers.length > 0) {
        for (const scorer of playerScorers) {
          if (scorer.playerId && scorer.count > 0) {
            const { data: p } = await supabase.from('players').select('goals').eq('id', scorer.playerId).single();
            if (p) {
              await supabase.from('players').update({ goals: (p.goals || 0) + scorer.count }).eq('id', scorer.playerId);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase match completion failed or partial, applying local fallback:', err);
    }
  }

  // 2. LOCAL STORAGE & DISCIPLINE PROCESSING
  const rawMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
  const rawTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
  const rawPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);

  const matches = rawMatches ? JSON.parse(rawMatches) : INITIAL_MATCHES;
  const teams = rawTeams ? JSON.parse(rawTeams) : INITIAL_TEAMS;
  const players = rawPlayers ? JSON.parse(rawPlayers) : INITIAL_PLAYERS;

  const matchIndex = matches.findIndex(m => m.id === matchId);
  const match = matchIndex !== -1 ? matches[matchIndex] : null;

  if (match) {
    const homeTeam = teams.find(t => t.id === match.home_team_id);
    const awayTeam = teams.find(t => t.id === match.away_team_id);

    const isHomeWin = hScore > aScore;
    const isAwayWin = aScore > hScore;
    const isDraw = hScore === aScore;

    match.home_score = hScore;
    match.away_score = aScore;
    match.status = 'Completed';

    if (homeTeam && match.status !== 'Completed') {
      homeTeam.matches_played += 1;
      homeTeam.goals_for += hScore;
      homeTeam.goals_against += aScore;
      if (isHomeWin) { homeTeam.wins += 1; homeTeam.points += 3; }
      else if (isDraw) { homeTeam.draws += 1; homeTeam.points += 1; }
      else { homeTeam.losses += 1; }
    }

    if (awayTeam && match.status !== 'Completed') {
      awayTeam.matches_played += 1;
      awayTeam.goals_for += aScore;
      awayTeam.goals_against += hScore;
      if (isAwayWin) { awayTeam.wins += 1; awayTeam.points += 3; }
      else if (isDraw) { awayTeam.draws += 1; awayTeam.points += 1; }
      else { awayTeam.losses += 1; }
    }

    // Save goals to players
    if (playerScorers && playerScorers.length > 0) {
      for (const sc of playerScorers) {
        const pl = players.find(p => p.id === sc.playerId);
        if (pl && sc.count > 0) {
          pl.goals = (pl.goals || 0) + sc.count;
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }

  // 3. SAVE MATCH EVENTS & LINEUPS
  await saveMatchDetails(matchId, { events, lineups });

  // 4. PROCESS DISCIPLINARY CARDS & SUSPENSION RULES
  const discRules = getDisciplinarySettings();
  let discCache = {};
  try {
    discCache = JSON.parse(localStorage.getItem('mfv_player_discipline') || '{}');
  } catch (_) {}

  // Apply yellow / red cards from events
  if (events && events.length > 0) {
    for (const ev of events) {
      if (!ev.playerId) continue;
      const pid = ev.playerId;
      const cur = discCache[pid] || { yellow_cards: 0, red_cards: 0, is_suspended: false, suspension_matches_remaining: 0, suspension_reason: '' };

      if (ev.type === 'yellow_card') {
        cur.yellow_cards = (cur.yellow_cards || 0) + 1;
        // Check yellow card suspension threshold
        if (cur.yellow_cards >= discRules.yellow_card_limit && (cur.yellow_cards % discRules.yellow_card_limit === 0)) {
          cur.is_suspended = true;
          cur.suspension_matches_remaining = 1;
          cur.suspension_reason = `Suspended for next match (${cur.yellow_cards} Yellow Cards)`;
        }
      } else if (ev.type === 'red_card') {
        cur.red_cards = (cur.red_cards || 0) + 1;
        cur.is_suspended = true;
        cur.suspension_matches_remaining = discRules.red_card_suspension_matches;
        cur.suspension_reason = `Suspended for next ${discRules.red_card_suspension_matches} matches (Direct Red Card)`;
      }

      discCache[pid] = cur;
    }
  }

  // Serve suspensions for suspended players belonging to the two teams who were already serving a ban
  if (match) {
    const playingTeamIds = [match.home_team_id, match.away_team_id];
    Object.keys(discCache).forEach(pid => {
      const p = discCache[pid];
      // Only advance if player was suspended BEFORE this match events
      const gotCardInThisMatch = events.some(e => e.playerId === pid && (e.type === 'yellow_card' || e.type === 'red_card'));
      if (p.is_suspended && !gotCardInThisMatch && p.suspension_matches_remaining > 0) {
        p.suspension_matches_remaining -= 1;
        if (p.suspension_matches_remaining <= 0) {
          p.is_suspended = false;
          p.suspension_matches_remaining = 0;
          p.suspension_reason = '';
        }
      }
    });
  }

  localStorage.setItem('mfv_player_discipline', JSON.stringify(discCache));

  return { success: true };
}

export const DEFAULT_DISCIPLINARY_RULES = {
  yellow_card_limit: 2, // 2 Yellow cards = 1 match ban
  red_card_suspension_matches: 2, // 1 Direct Red = 2 match ban
};

export function getDisciplinarySettings() {
  try {
    const raw = localStorage.getItem('mfv_disciplinary_settings');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_DISCIPLINARY_RULES;
}

export function saveDisciplinarySettings(settings) {
  localStorage.setItem('mfv_disciplinary_settings', JSON.stringify(settings));
  return settings;
}

export async function updatePlayerDiscipline(playerId, updates) {
  try {
    const cache = JSON.parse(localStorage.getItem('mfv_player_discipline') || '{}');
    cache[playerId] = {
      ...(cache[playerId] || {}),
      ...updates,
    };
    localStorage.setItem('mfv_player_discipline', JSON.stringify(cache));
  } catch (_) {}
  return true;
}

export async function clearAllSuspensions() {
  try {
    const cache = JSON.parse(localStorage.getItem('mfv_player_discipline') || '{}');
    Object.keys(cache).forEach(k => {
      cache[k].is_suspended = false;
      cache[k].suspension_matches_remaining = 0;
      cache[k].suspension_reason = '';
    });
    localStorage.setItem('mfv_player_discipline', JSON.stringify(cache));
  } catch (_) {}
  return true;
}

export async function saveMatchDetails(matchId, { events = [], lineups = null }) {
  try {
    const cache = JSON.parse(localStorage.getItem('mfv_match_details') || '{}');
    cache[matchId] = {
      ...(cache[matchId] || {}),
      ...(events ? { events } : {}),
      ...(lineups ? { lineups } : {}),
    };
    localStorage.setItem('mfv_match_details', JSON.stringify(cache));
  } catch (_) {}
  return true;
}

/**
 * Delete a match
 */
export async function deleteMatch(matchId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) throw error;
    return true;
  }

  const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
  let matches = raw ? JSON.parse(raw) : INITIAL_MATCHES;
  matches = matches.filter(m => m.id !== matchId);
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  return true;
}

/**
 * Delete a player
 */
export async function deletePlayer(playerId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('players').delete().eq('id', playerId);
    if (error) throw error;
    return true;
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  let players = raw ? JSON.parse(raw) : INITIAL_PLAYERS;
  players = players.filter(p => p.id !== playerId);
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  return true;
}

/**
 * Delete all players belonging to a specific team
 */
export async function deleteTeamPlayers(teamId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('players').delete().eq('team_id', teamId);
    if (error) throw error;
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  let players = raw ? JSON.parse(raw) : INITIAL_PLAYERS;
  players = players.filter(p => p.team_id !== teamId);
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  return true;
}

/**
 * Update player's goal tally directly
 */
export async function updatePlayerGoals(playerId, goals) {
  const g = parseInt(goals, 10);
  if (isNaN(g) || g < 0) throw new Error('Goals must be a non-negative number.');

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('players').update({ goals: g }).eq('id', playerId);
    if (error) throw error;
    return true;
  }

  const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const players = raw ? JSON.parse(raw) : INITIAL_PLAYERS;
  const p = players.find(x => x.id === playerId);
  if (p) {
    p.goals = g;
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  }
  return true;
}

/**
 * Reset local storage demo data to pristine 6-team state
 */
export function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
  localStorage.removeItem('mfv_match_details');
  localStorage.removeItem('mfv_player_discipline');
  return true;
}

/**
 * Export full tournament backup to JSON
 */
export async function exportTournamentBackup() {
  const teams = await getTeams();
  const players = await getPlayers();
  const matches = await getMatches();
  
  let matchDetails = {};
  let playerDiscipline = {};
  let disciplinarySettings = DEFAULT_DISCIPLINARY_RULES;

  try {
    matchDetails = JSON.parse(localStorage.getItem('mfv_match_details') || '{}');
  } catch (_) {}

  try {
    playerDiscipline = JSON.parse(localStorage.getItem('mfv_player_discipline') || '{}');
  } catch (_) {}

  try {
    disciplinarySettings = JSON.parse(localStorage.getItem('mfv_disciplinary_settings') || '{}') || DEFAULT_DISCIPLINARY_RULES;
  } catch (_) {}

  const backupData = {
    tournament: "Morning Football Vibes: The Morning Cup",
    season: 6,
    version: "6.0",
    exportTimestamp: new Date().toISOString(),
    stats: {
      teamsCount: teams.length,
      playersCount: players.length,
      matchesCount: matches.length,
      completedMatches: matches.filter(m => m.status === 'Completed').length,
    },
    data: {
      teams,
      players,
      matches,
      matchDetails,
      playerDiscipline,
      disciplinarySettings
    }
  };

  // Trigger browser download
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateSlug = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `morning-cup-season-6-backup-${dateSlug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return backupData;
}

/**
 * Restore full tournament backup from JSON object
 */
export async function restoreTournamentBackup(backupJson) {
  if (!backupJson || typeof backupJson !== 'object') {
    throw new Error('Invalid backup file format: must be a valid JSON object.');
  }

  const data = backupJson.data || backupJson;
  const teams = Array.isArray(data.teams) ? data.teams : [];
  const players = Array.isArray(data.players) ? data.players : [];
  const matches = Array.isArray(data.matches) ? data.matches : [];
  const matchDetails = data.matchDetails && typeof data.matchDetails === 'object' ? data.matchDetails : {};
  const playerDiscipline = data.playerDiscipline && typeof data.playerDiscipline === 'object' ? data.playerDiscipline : {};
  const disciplinarySettings = data.disciplinarySettings || DEFAULT_DISCIPLINARY_RULES;

  // Restore into localStorage caches
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  localStorage.setItem('mfv_match_details', JSON.stringify(matchDetails));
  localStorage.setItem('mfv_player_discipline', JSON.stringify(playerDiscipline));
  localStorage.setItem('mfv_disciplinary_settings', JSON.stringify(disciplinarySettings));

  // If Supabase is connected, sync the restored data
  if (isSupabaseConfigured && supabase) {
    try {
      if (teams.length > 0) {
        const teamsToInsert = teams.map(t => ({
          id: t.id,
          name: t.name,
          matches_played: t.matches_played || 0,
          wins: t.wins || 0,
          draws: t.draws || 0,
          losses: t.losses || 0,
          goals_for: t.goals_for || 0,
          goals_against: t.goals_against || 0,
          points: t.points || 0
        }));
        await supabase.from('teams').upsert(teamsToInsert, { onConflict: 'id' });
      }

      if (players.length > 0) {
        const playersToInsert = players.map(p => ({
          id: p.id,
          team_id: p.team_id,
          name: p.name,
          role: p.role,
          goals: p.goals || 0
        }));
        await supabase.from('players').upsert(playersToInsert, { onConflict: 'id' });
      }

      if (matches.length > 0) {
        const matchesToInsert = matches.map(m => ({
          id: m.id,
          home_team_id: m.home_team_id,
          away_team_id: m.away_team_id,
          match_time: m.match_time,
          home_score: m.home_score,
          away_score: m.away_score,
          status: m.status
        }));
        await supabase.from('matches').upsert(matchesToInsert, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('Supabase restore partial sync warning:', err);
    }
  }

  return {
    success: true,
    restored: {
      teams: teams.length,
      players: players.length,
      matches: matches.length
    }
  };
}

/**
 * Delete tournament data with selectable scope: 'matches_only', 'cards_only', or 'all'
 */
export async function deleteAllTournamentData(scope = 'all') {
  if (scope === 'cards_only') {
    localStorage.removeItem('mfv_player_discipline');
    return { success: true, message: 'All yellow/red cards and active suspensions cleared.' };
  }

  if (scope === 'matches_only') {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('teams').update({
          matches_played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0
        }).neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('players').update({ goals: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Supabase matches wipe warning:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
    localStorage.removeItem('mfv_match_details');
    localStorage.removeItem('mfv_player_discipline');

    const rawTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (rawTeams) {
      const teams = JSON.parse(rawTeams).map(t => ({
        ...t,
        matches_played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        points: 0
      }));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    }

    const rawPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (rawPlayers) {
      const players = JSON.parse(rawPlayers).map(p => ({ ...p, goals: 0 }));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    }

    return { success: true, message: 'All matches deleted, points table reset to 0, player goals cleared.' };
  }

  if (scope === 'all') {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Supabase complete wipe warning:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
    localStorage.removeItem('mfv_match_details');
    localStorage.removeItem('mfv_player_discipline');

    return { success: true, message: 'All tournament teams, squads, matches, and records wiped.' };
  }

  throw new Error(`Unknown scope: ${scope}`);
}
