-- ============================================================
-- Clinic Growth AI — Initial Schema Migration
-- 001_initial_schema.sql
-- ============================================================

-- UUIDs use gen_random_uuid() (built into Postgres 13+; no extension needed).

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE staff_role AS ENUM ('owner', 'admin', 'receptionist', 'doctor');

CREATE TYPE lead_source AS ENUM (
  'website', 'whatsapp', 'phone', 'walk_in', 'referral', 'ai_chat'
);

CREATE TYPE lead_status AS ENUM (
  'new', 'contacted', 'interested', 'appointment_requested',
  'appointment_confirmed', 'converted', 'lost'
);

CREATE TYPE appointment_status AS ENUM (
  'requested', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'
);

CREATE TYPE conversation_channel AS ENUM (
  'whatsapp', 'web_chat', 'email', 'phone'
);

CREATE TYPE conversation_status AS ENUM ('active', 'closed', 'escalated');

CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TYPE followup_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');

CREATE TYPE sales_status AS ENUM (
  'researched', 'contacted', 'interested', 'demo_scheduled', 'demo_done',
  'proposal_sent', 'negotiating', 'won', 'lost'
);

CREATE TYPE customer_plan AS ENUM ('standard', 'premium');

CREATE TYPE customer_status AS ENUM ('trial', 'active', 'churned', 'cancelled');

CREATE TYPE finance_type AS ENUM (
  'revenue_setup', 'revenue_recurring',
  'expense_software', 'expense_api', 'expense_contractor',
  'expense_marketing', 'expense_other'
);

CREATE TYPE review_request_status AS ENUM ('sent', 'responded', 'expired');

-- ============================================================
-- TENANT / CLINIC TABLES
-- ============================================================

CREATE TABLE clinics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  business_hours  JSONB DEFAULT '{}',
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_branches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role        staff_role NOT NULL DEFAULT 'receptionist',
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinic_faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  category    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEADS
-- ============================================================

CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  source       lead_source NOT NULL DEFAULT 'website',
  status       lead_status NOT NULL DEFAULT 'new',
  assigned_to  UUID REFERENCES clinic_staff(id) ON DELETE SET NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_activities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type  TEXT NOT NULL,
  description    TEXT,
  created_by     UUID REFERENCES clinic_staff(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE TABLE appointments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id          UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id            UUID REFERENCES leads(id) ON DELETE SET NULL,
  branch_id          UUID REFERENCES clinic_branches(id) ON DELETE SET NULL,
  doctor_id          UUID REFERENCES clinic_staff(id) ON DELETE SET NULL,
  appointment_date   DATE NOT NULL,
  appointment_time   TIME NOT NULL,
  duration_minutes   INT NOT NULL DEFAULT 30,
  status             appointment_status NOT NULL DEFAULT 'requested',
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointment_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  branch_id    UUID REFERENCES clinic_branches(id) ON DELETE CASCADE,
  doctor_id    UUID REFERENCES clinic_staff(id) ON DELETE CASCADE,
  day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AI / CONVERSATIONS
-- ============================================================

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id     UUID REFERENCES leads(id) ON DELETE SET NULL,
  channel     conversation_channel NOT NULL DEFAULT 'web_chat',
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  status      conversation_status NOT NULL DEFAULT 'active'
);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             message_role NOT NULL,
  content          TEXT NOT NULL,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FOLLOW-UPS
-- ============================================================

CREATE TABLE follow_up_rules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  trigger_event     TEXT NOT NULL,
  delay_hours       INT NOT NULL DEFAULT 24,
  message_template  TEXT NOT NULL,
  channel           conversation_channel NOT NULL DEFAULT 'whatsapp',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  max_attempts      INT NOT NULL DEFAULT 3,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE follow_up_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  rule_id         UUID REFERENCES follow_up_rules(id) ON DELETE SET NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  executed_at     TIMESTAMPTZ,
  status          followup_status NOT NULL DEFAULT 'pending',
  attempt_number  INT NOT NULL DEFAULT 1,
  response        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FEEDBACK / REVIEWS
-- ============================================================

CREATE TABLE review_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id      UUID REFERENCES leads(id) ON DELETE SET NULL,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_at  TIMESTAMPTZ,
  rating       INT CHECK (rating BETWEEN 1 AND 5),
  feedback     TEXT,
  status       review_request_status NOT NULL DEFAULT 'sent',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OWNER / ADMIN BUSINESS SYSTEM
-- ============================================================

CREATE TABLE prospects (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name          TEXT NOT NULL,
  location             TEXT,
  website              TEXT,
  contact_phone        TEXT,
  contact_email        TEXT,
  source_url           TEXT,
  research_date        DATE,
  qualification_score  INT CHECK (qualification_score BETWEEN 0 AND 100),
  sales_status         sales_status NOT NULL DEFAULT 'researched',
  last_interaction_at  TIMESTAMPTZ,
  next_action          TEXT,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prospect_activities (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id    UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  activity_type  TEXT NOT NULL,
  description    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID REFERENCES clinics(id) ON DELETE SET NULL,
  prospect_id     UUID REFERENCES prospects(id) ON DELETE SET NULL,
  plan            customer_plan NOT NULL DEFAULT 'standard',
  monthly_rate    DECIMAL(10, 2) NOT NULL,
  setup_fee       DECIMAL(10, 2) NOT NULL DEFAULT 0,
  start_date      DATE NOT NULL,
  trial_end_date  DATE,
  status          customer_status NOT NULL DEFAULT 'trial',
  health_score    INT CHECK (health_score BETWEEN 0 AND 100),
  next_renewal    DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE finance_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         finance_type NOT NULL,
  amount       DECIMAL(12, 2) NOT NULL,
  description  TEXT,
  date         DATE NOT NULL,
  customer_id  UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id    UUID,
  user_id      UUID,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  old_values   JSONB,
  new_values   JSONB,
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Clinics
CREATE INDEX idx_clinics_slug ON clinics(slug);

-- Staff
CREATE INDEX idx_clinic_staff_clinic_id ON clinic_staff(clinic_id);
CREATE INDEX idx_clinic_staff_user_id ON clinic_staff(user_id);

-- One active clinic per user (the RLS helper functions rely on this).
CREATE UNIQUE INDEX uq_clinic_staff_active_user
  ON clinic_staff(user_id)
  WHERE user_id IS NOT NULL AND is_active;

-- Leads
CREATE INDEX idx_leads_clinic_id ON leads(clinic_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Lead activities
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);

-- Appointments
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);

-- Conversations
CREATE INDEX idx_conversations_clinic_id ON conversations(clinic_id);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_status ON conversations(status);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Follow-ups
CREATE INDEX idx_follow_up_tasks_clinic_id ON follow_up_tasks(clinic_id);
CREATE INDEX idx_follow_up_tasks_lead_id ON follow_up_tasks(lead_id);
CREATE INDEX idx_follow_up_tasks_scheduled_at ON follow_up_tasks(scheduled_at);
CREATE INDEX idx_follow_up_tasks_status ON follow_up_tasks(status);

-- Prospects
CREATE INDEX idx_prospects_sales_status ON prospects(sales_status);

-- Customers
CREATE INDEX idx_customers_clinic_id ON customers(clinic_id);
CREATE INDEX idx_customers_status ON customers(status);

-- Finance
CREATE INDEX idx_finance_records_date ON finance_records(date DESC);
CREATE INDEX idx_finance_records_type ON finance_records(type);

-- Audit
CREATE INDEX idx_audit_log_clinic_id ON audit_log(clinic_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================================
-- TRIGGERS — updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clinic_branches_updated_at
  BEFORE UPDATE ON clinic_branches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clinic_staff_updated_at
  BEFORE UPDATE ON clinic_staff
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clinic_faqs_updated_at
  BEFORE UPDATE ON clinic_faqs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_follow_up_rules_updated_at
  BEFORE UPDATE ON follow_up_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- PLATFORM ADMINS (SaaS owner accounts)
-- ============================================================
-- Source of truth for platform-admin rights. Not client-readable or writable
-- (RLS enabled with no policies in 002; privileges revoked). Rows are inserted
-- manually by the Founder in the Supabase SQL editor. Never use user metadata.
CREATE TABLE platform_admins (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
