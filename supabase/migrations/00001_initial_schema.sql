-- ═══════════════════════════════════════════════════════════
-- NILES — Initial Database Schema
-- ═══════════════════════════════════════════════════════════

-- ── TEAMS ──

CREATE TABLE public.teams (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  owner_id        UUID NOT NULL,
  tier            TEXT NOT NULL DEFAULT 'dynasty'
                  CHECK (tier IN ('dynasty', 'empire')),
  max_seats       INT NOT NULL DEFAULT 10,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── PROFILES ──

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'team_lead', 'admin', 'super_admin')),
  tier            TEXT NOT NULL DEFAULT 'pharaoh'
                  CHECK (tier IN ('pharaoh', 'dynasty', 'empire')),
  team_id         UUID REFERENCES public.teams(id),
  query_count     INT NOT NULL DEFAULT 0,
  query_limit     INT NOT NULL DEFAULT 500,
  streak_days     INT NOT NULL DEFAULT 0,
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Add FK from teams.owner_id → profiles.id now that profiles exists
ALTER TABLE public.teams
  ADD CONSTRAINT teams_owner_fk FOREIGN KEY (owner_id) REFERENCES public.profiles(id);

-- ── CLIENTS ──

CREATE TABLE public.clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  company             TEXT,
  role_title          TEXT,
  industry            TEXT,
  decision_style      TEXT CHECK (decision_style IN (
                        'analytical', 'driver', 'amiable', 'expressive')),
  primary_motivation  TEXT CHECK (primary_motivation IN (
                        'long_term_roi', 'quick_wins', 'risk_reduction',
                        'innovation', 'cost_savings', 'market_share')),
  communication_pref  TEXT CHECK (communication_pref IN (
                        'data_reports', 'visual', 'verbal', 'written')),
  key_concerns        TEXT,
  emotional_triggers  TEXT,
  dna_profile         JSONB,
  p_purpose           INT DEFAULT 0,
  p_visioning         INT DEFAULT 0,
  p_knowledge         INT DEFAULT 0,
  p_kindness          INT DEFAULT 0,
  p_leadership        INT DEFAULT 0,
  p_trust             INT DEFAULT 0,
  p_emotional_intel   INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── DEALS ──

CREATE TABLE public.deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  value           DECIMAL(14,2),
  currency        TEXT DEFAULT 'USD',
  stage           TEXT NOT NULL DEFAULT 'prospecting'
                  CHECK (stage IN (
                    'prospecting', 'vision_aligned', 'trust_building',
                    'leadership_phase', 'closing', 'won', 'lost'
                  )),
  health_purpose          INT DEFAULT 50,
  health_visioning        INT DEFAULT 50,
  health_knowledge        INT DEFAULT 50,
  health_kindness         INT DEFAULT 50,
  health_leadership       INT DEFAULT 50,
  health_trust            INT DEFAULT 50,
  health_emotional_intel  INT DEFAULT 50,
  health_overall          INT GENERATED ALWAYS AS (
    (health_purpose + health_visioning + health_knowledge +
     health_kindness + health_leadership + health_trust +
     health_emotional_intel) / 7
  ) STORED,
  notes           TEXT,
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── CHAT SESSIONS ──

CREATE TABLE public.chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deal_id         UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  session_type    TEXT NOT NULL DEFAULT 'chat'
                  CHECK (session_type IN (
                    'chat', 'objection', 'roleplay',
                    'pre_meeting', 'debrief', 'email_draft'
                  )),
  title           TEXT,
  principle_tags  TEXT[],
  score           INT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── CHAT MESSAGES ──

CREATE TABLE public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  principle_tag   TEXT,
  chapter_ref     TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── TODOS ──

CREATE TABLE public.todos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deal_id         UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  content         TEXT NOT NULL,
  priority        TEXT DEFAULT 'medium'
                  CHECK (priority IN ('high', 'medium', 'low', 'grow')),
  is_completed    BOOLEAN DEFAULT FALSE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── CALENDAR EVENTS ──

CREATE TABLE public.calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deal_id         UUID REFERENCES public.deals(id),
  title           TEXT NOT NULL,
  description     TEXT,
  event_type      TEXT DEFAULT 'meeting'
                  CHECK (event_type IN ('meeting', 'call', 'demo', 'auto', 'review')),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── WEEKLY REVIEWS ──

CREATE TABLE public.weekly_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  summary         JSONB NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── DEAL ACTIVITIES ──

CREATE TABLE public.deal_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id         UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL CHECK (activity_type IN (
                    'stage_change', 'health_update', 'note', 'chat_session',
                    'pre_meeting', 'debrief', 'email_sent', 'objection_handled',
                    'roleplay_completed', 'score_change'
                  )),
  description     TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════

CREATE INDEX idx_clients_user ON public.clients(user_id);
CREATE INDEX idx_deals_user ON public.deals(user_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_todos_user_date ON public.todos(user_id, due_date);
CREATE INDEX idx_deal_activities_deal ON public.deal_activities(deal_id);
CREATE INDEX idx_weekly_reviews_user ON public.weekly_reviews(user_id, week_start);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view their team"
  ON public.teams FOR SELECT USING (
    id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "Team owners can update their team"
  ON public.teams FOR UPDATE USING (owner_id = auth.uid());

-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own clients"
  ON public.clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Team leads see team clients"
  ON public.clients FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('team_lead', 'admin')
        AND p.team_id = (
          SELECT team_id FROM public.profiles WHERE id = clients.user_id
        )
    )
  );

-- Deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own deals"
  ON public.deals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Team leads see team deals"
  ON public.deals FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('team_lead', 'admin')
        AND p.team_id = (
          SELECT team_id FROM public.profiles WHERE id = deals.user_id
        )
    )
  );

-- Chat Sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own chat sessions"
  ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);

-- Chat Messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own chat messages"
  ON public.chat_messages FOR ALL USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Todos
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own todos"
  ON public.todos FOR ALL USING (auth.uid() = user_id);

-- Calendar Events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own calendar events"
  ON public.calendar_events FOR ALL USING (auth.uid() = user_id);

-- Weekly Reviews
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own weekly reviews"
  ON public.weekly_reviews FOR ALL USING (auth.uid() = user_id);

-- Deal Activities
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own deal activities"
  ON public.deal_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Team leads see team deal activities"
  ON public.deal_activities FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('team_lead', 'admin')
        AND p.team_id = (
          SELECT team_id FROM public.profiles WHERE id = deal_activities.user_id
        )
    )
  );

-- ═══════════════════════════════════════════════════════════
-- FUNCTION: Auto-create profile on signup
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
-- FUNCTION: Auto-update updated_at timestamp
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
