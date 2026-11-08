-- ==============================================================================
-- "Morning Football Vibes: The Morning Cup" (6-Team Tournament)
-- Supabase Database Schema & Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLEAN REBUILD (Safe Drop for Fresh or Existing Databases)
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP FUNCTION IF EXISTS complete_match(UUID, INT, INT) CASCADE;
DROP FUNCTION IF EXISTS complete_match CASCADE;

-- 3. TEAMS TABLE
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    matches_played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    draws INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PLAYERS TABLE
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Forward', 'Midfielder', 'Center Back', 'Goalkeeper', 'Coach')),
    goals INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MATCHES TABLE
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_time TIMESTAMPTZ NOT NULL,
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_different_teams CHECK (home_team_id <> away_team_id)
);

-- 6. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_goals ON players(goals DESC);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_time ON matches(match_time ASC);
CREATE INDEX idx_teams_points ON teams(points DESC, (goals_for - goals_against) DESC, goals_for DESC);

-- 7. STORED PROCEDURE / RPC FOR ATOMIC MATCH COMPLETION
CREATE OR REPLACE FUNCTION complete_match(
    p_match_id UUID,
    p_home_score INT,
    p_away_score INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_home_id UUID;
    v_away_id UUID;
    v_old_status TEXT;
    v_home_pts INT := 0;
    v_away_pts INT := 0;
    v_home_win INT := 0;
    v_home_draw INT := 0;
    v_home_loss INT := 0;
    v_away_win INT := 0;
    v_away_draw INT := 0;
    v_away_loss INT := 0;
BEGIN
    -- Get match details
    SELECT home_team_id, away_team_id, status 
    INTO v_home_id, v_away_id, v_old_status
    FROM matches
    WHERE id = p_match_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Match not found with id %', p_match_id;
    END IF;

    -- Only process if match is not already completed
    IF v_old_status = 'Completed' THEN
        RAISE EXCEPTION 'Match has already been completed.';
    END IF;

    -- Calculate win/loss/draw & points
    IF p_home_score > p_away_score THEN
        v_home_win := 1;
        v_home_pts := 3;
        v_away_loss := 1;
    ELSIF p_away_score > p_home_score THEN
        v_away_win := 1;
        v_away_pts := 3;
        v_home_loss := 1;
    ELSE
        v_home_draw := 1;
        v_home_pts := 1;
        v_away_draw := 1;
        v_away_pts := 1;
    END IF;

    -- Update Match record
    UPDATE matches
    SET home_score = p_home_score,
        away_score = p_away_score,
        status = 'Completed'
    WHERE id = p_match_id;

    -- Update Home Team record
    UPDATE teams
    SET matches_played = matches_played + 1,
        wins = wins + v_home_win,
        draws = draws + v_home_draw,
        losses = losses + v_home_loss,
        goals_for = goals_for + p_home_score,
        goals_against = goals_against + p_away_score,
        points = points + v_home_pts
    WHERE id = v_home_id;

    -- Update Away Team record
    UPDATE teams
    SET matches_played = matches_played + 1,
        wins = wins + v_away_win,
        draws = draws + v_away_draw,
        losses = losses + v_away_loss,
        goals_for = goals_for + p_away_score,
        goals_against = goals_against + p_home_score,
        points = points + v_away_pts
    WHERE id = v_away_id;
END;
$$;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Public teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Public players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Public matches are viewable by everyone" ON matches FOR SELECT USING (true);

-- Allow Public/Anon Admin Access
CREATE POLICY "Anon insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Anon delete teams" ON teams FOR DELETE USING (true);

CREATE POLICY "Anon insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Anon delete players" ON players FOR DELETE USING (true);

CREATE POLICY "Anon insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Anon delete matches" ON matches FOR DELETE USING (true);

-- ==============================================================================
-- 9. SEED DATA (6 Teams, Rosters with Roles, Matches)
-- ==============================================================================
DO $$
DECLARE
    t1 UUID; t2 UUID; t3 UUID; t4 UUID; t5 UUID; t6 UUID;
BEGIN
    -- Insert 6 Teams
    INSERT INTO teams (name, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES ('Sunrise Strikers FC', 2, 2, 0, 0, 5, 1, 6) RETURNING id INTO t1;

    INSERT INTO teams (name, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES ('Early Birds United', 2, 1, 1, 0, 4, 2, 4) RETURNING id INTO t2;

    INSERT INTO teams (name, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES ('Dawn Patrol Athletic', 2, 1, 0, 1, 3, 3, 3) RETURNING id INTO t3;

    INSERT INTO teams (name, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES ('Morning Glory Rovers', 2, 0, 2, 0, 2, 2, 2) RETURNING id INTO t4;

    INSERT INTO teams (name, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES ('Dew Point Dynamo', 2, 0, 1, 1, 1, 3, 1) RETURNING id INTO t5;

    INSERT INTO teams (name, matches_played, wins, draws, losses, goals_for, goals_against, points)
    VALUES ('Golden Hour FC', 2, 0, 0, 2, 1, 5, 0) RETURNING id INTO t6;

    -- Insert Players for Team 1: Sunrise Strikers FC
    INSERT INTO players (team_id, name, role, goals) VALUES
    (t1, 'Leo Martinez', 'Forward', 3),
    (t1, 'Marco Silva', 'Forward', 1),
    (t1, 'Julian Draxler', 'Midfielder', 1),
    (t1, 'Lucas Hernandez', 'Center Back', 0),
    (t1, 'Alisson Becker', 'Goalkeeper', 0),
    (t1, 'Coach Carlo', 'Coach', 0);

    -- Insert Players for Team 2: Early Birds United
    INSERT INTO players (team_id, name, role, goals) VALUES
    (t2, 'Tariq Adams', 'Forward', 2),
    (t2, 'Kevin De Jong', 'Midfielder', 2),
    (t2, 'Mateo Kovacic', 'Midfielder', 0),
    (t2, 'Virgil Stones', 'Center Back', 0),
    (t2, 'David De Gea', 'Goalkeeper', 0),
    (t2, 'Coach Jurgen', 'Coach', 0);

    -- Insert Players for Team 3: Dawn Patrol Athletic
    INSERT INTO players (team_id, name, role, goals) VALUES
    (t3, 'Sammy Rodriguez', 'Forward', 2),
    (t3, 'David Silva', 'Midfielder', 1),
    (t3, 'Ruben Dias', 'Center Back', 0),
    (t3, 'Giorgio Chiellini', 'Center Back', 0),
    (t3, 'Manuel Neuer', 'Goalkeeper', 0),
    (t3, 'Coach Pep', 'Coach', 0);

    -- Insert Players for Team 4: Morning Glory Rovers
    INSERT INTO players (team_id, name, role, goals) VALUES
    (t4, 'Marcus Rashford', 'Forward', 1),
    (t4, 'Bruno Fernandes', 'Midfielder', 1),
    (t4, 'Declan Rice', 'Midfielder', 0),
    (t4, 'John Terry', 'Center Back', 0),
    (t4, 'Ederson Moraes', 'Goalkeeper', 0),
    (t4, 'Coach Jose', 'Coach', 0);

    -- Insert Players for Team 5: Dew Point Dynamo
    INSERT INTO players (team_id, name, role, goals) VALUES
    (t5, 'Erling Haaland', 'Forward', 1),
    (t5, 'Martin Odegaard', 'Midfielder', 0),
    (t5, 'William Saliba', 'Center Back', 0),
    (t5, 'Thibaut Courtois', 'Goalkeeper', 0),
    (t5, 'Coach Mikel', 'Coach', 0);

    -- Insert Players for Team 6: Golden Hour FC
    INSERT INTO players (team_id, name, role, goals) VALUES
    (t6, 'Sonny Heung', 'Forward', 1),
    (t6, 'Luka Modric', 'Midfielder', 0),
    (t6, 'Casemiro Santos', 'Midfielder', 0),
    (t6, 'Sergio Ramos', 'Center Back', 0),
    (t6, 'Gianluigi Buffon', 'Goalkeeper', 0),
    (t6, 'Coach Zinedine', 'Coach', 0);

    -- Insert Matches: Completed (Matchweek 1 & 2)
    INSERT INTO matches (home_team_id, away_team_id, match_time, home_score, away_score, status) VALUES
    (t1, t6, NOW() - INTERVAL '3 days' + INTERVAL '6 hours 30 mins', 3, 0, 'Completed'),
    (t2, t5, NOW() - INTERVAL '3 days' + INTERVAL '7 hours 45 mins', 2, 0, 'Completed'),
    (t3, t4, NOW() - INTERVAL '3 days' + INTERVAL '9 hours 00 mins', 2, 1, 'Completed'),
    (t1, t3, NOW() - INTERVAL '1 days' + INTERVAL '6 hours 30 mins', 2, 1, 'Completed'),
    (t2, t4, NOW() - INTERVAL '1 days' + INTERVAL '7 hours 45 mins', 1, 1, 'Completed'),
    (t5, t6, NOW() - INTERVAL '1 days' + INTERVAL '9 hours 00 mins', 1, 1, 'Completed');

    -- Insert Matches: Scheduled (Upcoming Matchweek 3)
    INSERT INTO matches (home_team_id, away_team_id, match_time, home_score, away_score, status) VALUES
    (t1, t2, NOW() + INTERVAL '1 days' + INTERVAL '7 hours', NULL, NULL, 'Scheduled'),
    (t3, t5, NOW() + INTERVAL '1 days' + INTERVAL '8 hours 15 mins', NULL, NULL, 'Scheduled'),
    (t4, t6, NOW() + INTERVAL '1 days' + INTERVAL '9 hours 30 mins', NULL, NULL, 'Scheduled'),
    (t1, t4, NOW() + INTERVAL '3 days' + INTERVAL '7 hours', NULL, NULL, 'Scheduled'),
    (t2, t6, NOW() + INTERVAL '3 days' + INTERVAL '8 hours 15 mins', NULL, NULL, 'Scheduled'),
    (t3, t2, NOW() + INTERVAL '4 days' + INTERVAL '7 hours', NULL, NULL, 'Scheduled');

END $$;
