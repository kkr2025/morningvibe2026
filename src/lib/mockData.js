export const INITIAL_TEAMS = [
  {
    id: "team-1",
    name: "Sunrise Strikers FC",
    matches_played: 2,
    wins: 2,
    draws: 0,
    losses: 0,
    goals_for: 5,
    goals_against: 1,
    points: 6,
    color: "#16a34a",
    badge: "🌅",
    created_at: new Date().toISOString()
  },
  {
    id: "team-2",
    name: "Early Birds United",
    matches_played: 2,
    wins: 1,
    draws: 1,
    losses: 0,
    goals_for: 4,
    goals_against: 2,
    points: 4,
    color: "#0284c7",
    badge: "🦅",
    created_at: new Date().toISOString()
  },
  {
    id: "team-3",
    name: "Dawn Patrol Athletic",
    matches_played: 2,
    wins: 1,
    draws: 0,
    losses: 1,
    goals_for: 3,
    goals_against: 3,
    points: 3,
    color: "#d97706",
    badge: "⚡",
    created_at: new Date().toISOString()
  },
  {
    id: "team-4",
    name: "Morning Glory Rovers",
    matches_played: 2,
    wins: 0,
    draws: 2,
    losses: 0,
    goals_for: 2,
    goals_against: 2,
    points: 2,
    color: "#9333ea",
    badge: "🌸",
    created_at: new Date().toISOString()
  },
  {
    id: "team-5",
    name: "Dew Point Dynamo",
    matches_played: 2,
    wins: 0,
    draws: 1,
    losses: 1,
    goals_for: 1,
    goals_against: 3,
    points: 1,
    color: "#0d9488",
    badge: "💧",
    created_at: new Date().toISOString()
  },
  {
    id: "team-6",
    name: "Golden Hour FC",
    matches_played: 2,
    wins: 0,
    draws: 0,
    losses: 2,
    goals_for: 1,
    goals_against: 5,
    points: 0,
    color: "#e11d48",
    badge: "☀️",
    created_at: new Date().toISOString()
  }
];

export const INITIAL_PLAYERS = [
  // Sunrise Strikers
  { id: "p-101", team_id: "team-1", name: "Leo Martinez", role: "Forward", goals: 3 },
  { id: "p-102", team_id: "team-1", name: "Marco Silva", role: "Forward", goals: 1 },
  { id: "p-103", team_id: "team-1", name: "Julian Draxler", role: "Midfielder", goals: 1 },
  { id: "p-104", team_id: "team-1", name: "Lucas Hernandez", role: "Center Back", goals: 0 },
  { id: "p-105", team_id: "team-1", name: "Alisson Becker", role: "Goalkeeper", goals: 0 },
  { id: "p-106", team_id: "team-1", name: "Coach Carlo", role: "Coach", goals: 0 },

  // Early Birds United
  { id: "p-201", team_id: "team-2", name: "Tariq Adams", role: "Forward", goals: 2 },
  { id: "p-202", team_id: "team-2", name: "Kevin De Jong", role: "Midfielder", goals: 2 },
  { id: "p-203", team_id: "team-2", name: "Mateo Kovacic", role: "Midfielder", goals: 0 },
  { id: "p-204", team_id: "team-2", name: "Virgil Stones", role: "Center Back", goals: 0 },
  { id: "p-205", team_id: "team-2", name: "David De Gea", role: "Goalkeeper", goals: 0 },
  { id: "p-206", team_id: "team-2", name: "Coach Jurgen", role: "Coach", goals: 0 },

  // Dawn Patrol Athletic
  { id: "p-301", team_id: "team-3", name: "Sammy Rodriguez", role: "Forward", goals: 2 },
  { id: "p-302", team_id: "team-3", name: "David Silva", role: "Midfielder", goals: 1 },
  { id: "p-303", team_id: "team-3", name: "Ruben Dias", role: "Center Back", goals: 0 },
  { id: "p-304", team_id: "team-3", name: "Manuel Neuer", role: "Goalkeeper", goals: 0 },
  { id: "p-305", team_id: "team-3", name: "Coach Pep", role: "Coach", goals: 0 },

  // Morning Glory Rovers
  { id: "p-401", team_id: "team-4", name: "Marcus Rashford", role: "Forward", goals: 1 },
  { id: "p-402", team_id: "team-4", name: "Bruno Fernandes", role: "Midfielder", goals: 1 },
  { id: "p-403", team_id: "team-4", name: "Declan Rice", role: "Midfielder", goals: 0 },
  { id: "p-404", team_id: "team-4", name: "John Terry", role: "Center Back", goals: 0 },
  { id: "p-405", team_id: "team-4", name: "Ederson Moraes", role: "Goalkeeper", goals: 0 },
  { id: "p-406", team_id: "team-4", name: "Coach Jose", role: "Coach", goals: 0 },

  // Dew Point Dynamo
  { id: "p-501", team_id: "team-5", name: "Erling Haaland", role: "Forward", goals: 1 },
  { id: "p-502", team_id: "team-5", name: "Martin Odegaard", role: "Midfielder", goals: 0 },
  { id: "p-503", team_id: "team-5", name: "William Saliba", role: "Center Back", goals: 0 },
  { id: "p-504", team_id: "team-5", name: "Thibaut Courtois", role: "Goalkeeper", goals: 0 },
  { id: "p-505", team_id: "team-5", name: "Coach Mikel", role: "Coach", goals: 0 },

  // Golden Hour FC
  { id: "p-601", team_id: "team-6", name: "Sonny Heung", role: "Forward", goals: 1 },
  { id: "p-602", team_id: "team-6", name: "Luka Modric", role: "Midfielder", goals: 0 },
  { id: "p-603", team_id: "team-6", name: "Sergio Ramos", role: "Center Back", goals: 0 },
  { id: "p-604", team_id: "team-6", name: "Gianluigi Buffon", role: "Goalkeeper", goals: 0 },
  { id: "p-605", team_id: "team-6", name: "Coach Zinedine", role: "Coach", goals: 0 },
];

export const INITIAL_MATCHES = [
  // Completed matches
  {
    id: "m-1",
    home_team_id: "team-1",
    away_team_id: "team-6",
    match_time: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 6.5 * 3600 * 1000).toISOString(),
    home_score: 3,
    away_score: 0,
    status: "Completed"
  },
  {
    id: "m-2",
    home_team_id: "team-2",
    away_team_id: "team-5",
    match_time: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 7.75 * 3600 * 1000).toISOString(),
    home_score: 2,
    away_score: 0,
    status: "Completed"
  },
  {
    id: "m-3",
    home_team_id: "team-3",
    away_team_id: "team-4",
    match_time: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 9 * 3600 * 1000).toISOString(),
    home_score: 2,
    away_score: 1,
    status: "Completed"
  },
  {
    id: "m-4",
    home_team_id: "team-1",
    away_team_id: "team-3",
    match_time: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 6.5 * 3600 * 1000).toISOString(),
    home_score: 2,
    away_score: 1,
    status: "Completed"
  },
  {
    id: "m-5",
    home_team_id: "team-2",
    away_team_id: "team-4",
    match_time: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 7.75 * 3600 * 1000).toISOString(),
    home_score: 1,
    away_score: 1,
    status: "Completed"
  },
  {
    id: "m-6",
    home_team_id: "team-5",
    away_team_id: "team-6",
    match_time: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 9 * 3600 * 1000).toISOString(),
    home_score: 1,
    away_score: 1,
    status: "Completed"
  },

  // Scheduled matches
  {
    id: "m-7",
    home_team_id: "team-1",
    away_team_id: "team-2",
    match_time: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 7 * 3600 * 1000).toISOString(),
    home_score: null,
    away_score: null,
    status: "Scheduled"
  },
  {
    id: "m-8",
    home_team_id: "team-3",
    away_team_id: "team-5",
    match_time: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 8.25 * 3600 * 1000).toISOString(),
    home_score: null,
    away_score: null,
    status: "Scheduled"
  },
  {
    id: "m-9",
    home_team_id: "team-4",
    away_team_id: "team-6",
    match_time: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 9.5 * 3600 * 1000).toISOString(),
    home_score: null,
    away_score: null,
    status: "Scheduled"
  },
  {
    id: "m-10",
    home_team_id: "team-1",
    away_team_id: "team-4",
    match_time: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 7 * 3600 * 1000).toISOString(),
    home_score: null,
    away_score: null,
    status: "Scheduled"
  }
];
