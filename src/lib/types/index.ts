import type { PrincipleKey } from "@/lib/utils/principles";
import type { TierKey } from "@/lib/utils/tiers";

// ── Users & Teams ──

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: "user" | "team_lead" | "admin" | "super_admin";
  tier: TierKey;
  team_id: string | null;
  query_count: number;
  query_limit: number;
  streak_days: number;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  tier: "dynasty" | "empire";
  max_seats: number;
  created_at: string;
}

// ── Clients ──

export type DecisionStyle =
  | "analytical"
  | "driver"
  | "amiable"
  | "expressive";

export type PrimaryMotivation =
  | "long_term_roi"
  | "quick_wins"
  | "risk_reduction"
  | "innovation"
  | "cost_savings"
  | "market_share";

export type CommunicationPref =
  | "data_reports"
  | "visual"
  | "verbal"
  | "written";

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role_title: string | null;
  industry: string | null;
  decision_style: DecisionStyle | null;
  primary_motivation: PrimaryMotivation | null;
  communication_pref: CommunicationPref | null;
  key_concerns: string | null;
  emotional_triggers: string | null;
  dna_profile: Record<string, unknown> | null;
  p_purpose: number;
  p_visioning: number;
  p_knowledge: number;
  p_kindness: number;
  p_leadership: number;
  p_trust: number;
  p_emotional_intel: number;
  created_at: string;
  updated_at: string;
}

// ── Deals ──

export type DealStage =
  | "prospecting"
  | "vision_aligned"
  | "trust_building"
  | "leadership_phase"
  | "closing"
  | "won"
  | "lost";

export interface Deal {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string;
  value: number | null;
  currency: string;
  stage: DealStage;
  health_purpose: number;
  health_visioning: number;
  health_knowledge: number;
  health_kindness: number;
  health_leadership: number;
  health_trust: number;
  health_emotional_intel: number;
  health_overall: number;
  notes: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: Client;
}

// ── Chat ──

export type SessionType =
  | "chat"
  | "objection"
  | "roleplay"
  | "pre_meeting"
  | "debrief"
  | "email_draft";

export interface ChatSession {
  id: string;
  user_id: string;
  deal_id: string | null;
  client_id: string | null;
  session_type: SessionType;
  title: string | null;
  principle_tags: string[] | null;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  principle_tag: PrincipleKey | null;
  chapter_ref: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Todos ──

export type TodoPriority = "high" | "medium" | "low" | "grow";

export interface Todo {
  id: string;
  user_id: string;
  deal_id: string | null;
  content: string;
  priority: TodoPriority;
  is_completed: boolean;
  is_ai_generated: boolean;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

// ── Calendar Events ──

export type EventType = "meeting" | "call" | "demo" | "auto" | "review";

export interface CalendarEvent {
  id: string;
  user_id: string;
  deal_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

// ── Weekly Reviews ──

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  summary: {
    deals_moved?: number;
    deals_stagnant?: number;
    wins?: number;
    losses?: number;
    priorities?: string[];
    blind_spots?: string[];
    wisdom_quote?: string;
  };
  is_read: boolean;
  created_at: string;
}

// ── Deal Activities ──

export type ActivityType =
  | "stage_change"
  | "health_update"
  | "note"
  | "chat_session"
  | "pre_meeting"
  | "debrief"
  | "email_sent"
  | "objection_handled"
  | "roleplay_completed"
  | "score_change";

export interface DealActivity {
  id: string;
  deal_id: string;
  user_id: string;
  activity_type: ActivityType;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
